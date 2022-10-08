import { ArrowRightOutlined, CaretRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useReactiveVar } from '@apollo/client'
import { MaxUint256 } from '@ethersproject/constants'
import { Button, Collapse, Input, InputNumber, Tooltip } from 'antd'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import externalLink from '../../assets/icons/external-link-blue.svg'
import iconInfo from '../../assets/icons/info.svg'
import metamaskIcon from '../../assets/icons/metamask-icon.svg'
import nftfyIcon from '../../assets/icons/nftfy-white-tint-orange.svg'
import bscIcon from '../../assets/networks/bsc.svg'
import ethereumIcon from '../../assets/networks/ethereum.svg'
import { getChainConfigById } from '../../config'
import { accountVar, chainIdVar, connectWalletModalVar } from '../../graphql/variables/WalletVariable'
import { approveErc20Bridge, isApprovedErc20 } from '../../services/NftfyService'
import { notifySuccess } from '../../services/NotificationService'
import { calculateDepositParams, getFee } from '../../services/PanelService'
import { deposit, getErc20BalanceOf, getErc20TotalSupply } from '../../services/TrustedBridge'
import { scale } from '../../services/UtilService'
import { addNftFyToMetamask, getErc20Balance } from '../../services/WalletService'
import { colors, fonts, viewport } from '../../styles/variables'

export const BridgeForm = () => {
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)
  const { Panel } = Collapse

  const isEthereum = chainId === 1

  const { nftfyTokenAddress, nftfyTokenDecimals, bridge, etherscanAddress, bscScanAddress } = getChainConfigById(chainId)
  const { trustedBridge } = bridge
  const { bsc, ethereum } = bridge.networks

  const isRightNetwork = chainId === bsc.chainId || chainId === ethereum.chainId

  const [amount, setAmount] = useState<string | undefined>('')
  const [amountFee, setAmountFee] = useState('0')
  const [amountNet, setAmountNet] = useState('0')
  const [balanceNftfy, setBalanceNftfy] = useState('0')
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [totalSupply, setTotalSupply] = useState<BigNumber | undefined>(undefined)
  const [ethSupply, setEthSupply] = useState<BigNumber | undefined>(undefined)
  const [ethIssued, setEthIssued] = useState<BigNumber | undefined>(undefined)
  const [ethBurned, setEthBurned] = useState<BigNumber | undefined>(undefined)
  const [ethLocked, setEthLocked] = useState<BigNumber | undefined>(undefined)
  const [ethPercentage, setEthPercentage] = useState<BigNumber | undefined>(undefined)
  const [bscIssued, setBscIssued] = useState<BigNumber | undefined>(undefined)
  const [bscBurned, setBscBurned] = useState<BigNumber | undefined>(undefined)
  const [bscLocked, setBscLocked] = useState<BigNumber | undefined>(undefined)
  const [bscSupply, setBscSupply] = useState<BigNumber | undefined>(undefined)
  const [bscPercentage, setBscPercentage] = useState<BigNumber | undefined>(undefined)

  const [loadingApproval, setLoadingApproval] = useState<boolean>(false)
  const [loadingBridge, setLoadingBridge] = useState<boolean>(false)

  const connectWallet = async () => {
    connectWalletModalVar(true)
  }

  const setMaxValue = () => {
    setAmount(balanceNftfy || '')
  }

  const handleAmountChange = (value: string | number | null | undefined) => {
    if (value) {
      setAmount(value.toString().replace(',', '.'))
    } else {
      setAmount('')
    }
  }

  const approveBridge = async () => {
    setLoadingApproval(true)
    await approveErc20Bridge(nftfyTokenAddress, nftfyTokenDecimals, MaxUint256.toString(), chainId, trustedBridge)
    await checkIsApproved()
    setLoadingApproval(false)
  }

  const executeBridge = async () => {
    try {
      setLoadingBridge(true)
      const selectedChainId = isEthereum ? bridge.networks.bsc.chainId : bridge.networks.ethereum.chainId
      const depositParams = account && amount && (await calculateDepositParams(account, amount, nftfyTokenDecimals, selectedChainId))

      account &&
        depositParams &&
        (await deposit(
          depositParams._targetBridge,
          depositParams._targetChainId,
          depositParams._server,
          depositParams._sourceAmount,
          depositParams._targetAmount,
          depositParams._timestamp,
          depositParams._transferId,
          account
        ))
      const balance = account && (await getErc20Balance(account, nftfyTokenAddress, nftfyTokenDecimals, chainId))
      setLoadingBridge(false)
      balance && setBalanceNftfy(balance.toString())
      setAmount('')
      notifySuccess(`Your transaction is being processed on ${isEthereum ? 'BSC' : 'ETH'} network.`)
    } catch (error) {
      setAmount('')
    }
  }

  const checkFee = useCallback(async () => {
    if (chainId) {
      const fees = await getFee(isEthereum ? bsc.chainId : ethereum.chainId)
      const fee = new BigNumber(fees.fixedFeeAmount).plus(new BigNumber(fees.variableFeeRate))
      setAmountFee(scale(fee, -18).toString())
    }
  }, [bsc.chainId, chainId, ethereum.chainId, isEthereum])

  const checkBalance = useCallback(async () => {
    if (account && chainId) {
      const balance = await getErc20Balance(account, nftfyTokenAddress, nftfyTokenDecimals, chainId)
      setBalanceNftfy(balance.toString())
    }
  }, [account, chainId, nftfyTokenAddress, nftfyTokenDecimals])

  const checkNetAmount = useCallback(async () => {
    if (amount) {
      const netAmount = new BigNumber(amount).minus(new BigNumber(amountFee))
      setAmountNet(Number(netAmount.toString(10)) < 0 ? '0' : netAmount.toString(10))
    }
  }, [amount, amountFee])

  const checkIsApproved = useCallback(async () => {
    const isApprovedValue = account && (await isApprovedErc20(trustedBridge, account, chainId))

    setIsApproved(Number(isApprovedValue) > 0)
  }, [trustedBridge, account, chainId])

  const checkTotalSupply = useCallback(async () => {
    const bscTotalSupply = await getErc20TotalSupply(nftfyTokenAddress, bsc.chainId, true)
    const bscOperatorBalance = await getErc20BalanceOf(nftfyTokenAddress, bsc.operator, bsc.chainId, true)
    const bscVaultBalance = await getErc20BalanceOf(nftfyTokenAddress, bsc.vault, bsc.chainId, true)
    const bscMultisigBalance = await getErc20BalanceOf(nftfyTokenAddress, bsc.multisig, bsc.chainId, true)

    const ethTotalSupply = await getErc20TotalSupply(nftfyTokenAddress, ethereum.chainId)
    const ethOperatorBalance = await getErc20BalanceOf(nftfyTokenAddress, ethereum.operator, ethereum.chainId)
    const ethVaultBalance = await getErc20BalanceOf(nftfyTokenAddress, ethereum.vault, ethereum.chainId)
    const ethMultisigBalance = await getErc20BalanceOf(nftfyTokenAddress, ethereum.multisig, ethereum.chainId)

    const issuedTokens = new BigNumber(100000000)

    const ethBurnedValue = issuedTokens.minus(ethTotalSupply)
    const ethLockedValue = ethOperatorBalance.plus(ethVaultBalance).plus(ethMultisigBalance)
    const ethSupplyValue = issuedTokens.minus(new BigNumber(ethBurnedValue.plus(ethLockedValue)))

    const bscBurnedValue = issuedTokens.minus(bscTotalSupply)
    const bscLockedValue = bscOperatorBalance.plus(bscVaultBalance).plus(bscMultisigBalance)
    const bscSupplyValue = issuedTokens.minus(new BigNumber(bscBurnedValue.plus(bscLockedValue)))

    const totalSupplyValue = ethSupplyValue.plus(bscSupplyValue)

    const ethPercentageValue = ethSupplyValue.div(totalSupplyValue).multipliedBy(100)
    const bscPercentageValue = bscSupplyValue.div(totalSupplyValue).multipliedBy(100)

    setBscIssued(issuedTokens)
    setEthIssued(issuedTokens)
    setEthBurned(ethBurnedValue)
    setEthLocked(ethLockedValue)
    setEthSupply(ethSupplyValue)
    setBscLocked(bscLockedValue)
    setBscBurned(bscBurnedValue)
    setBscSupply(bscSupplyValue)
    setTotalSupply(totalSupplyValue)
    setEthPercentage(ethPercentageValue)
    setBscPercentage(bscPercentageValue)
  }, [
    bsc.chainId,
    bsc.multisig,
    bsc.operator,
    bsc.vault,
    ethereum.chainId,
    ethereum.multisig,
    ethereum.operator,
    ethereum.vault,
    nftfyTokenAddress
  ])

  useEffect(() => {
    checkIsApproved()
  }, [account, checkIsApproved])

  useEffect(() => {
    checkBalance()
  }, [account, checkBalance])

  useEffect(() => {
    checkFee()
  }, [checkFee])

  useEffect(() => {
    checkNetAmount()
  }, [checkNetAmount])

  useEffect(() => {
    checkTotalSupply()
  }, [checkTotalSupply])

  return (
    <S.Section>
      <S.TitleContent>
        NFTFY
        <strong> BRIDGE</strong>
      </S.TitleContent>
      <S.Container>
        <S.InfoContainer>
          <h3>Token Supply</h3>

          <span>
            {totalSupply && `Total Supply: ${totalSupply.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}
            <Tooltip title='Total supply is the amount issued on each network deducting funds burned or locked by bridge contracts.'>
              <img src={iconInfo} alt='info' />
            </Tooltip>
          </span>
          <span>
            Max Supply: 100,000,000.00
            <Tooltip title='Max supply is the maximum amount of tokens to be issued and unlocked on all networks.'>
              <img src={iconInfo} alt='info' />
            </Tooltip>
          </span>

          <p>
            Information about the circulating supply and its distribution over time can be found on the
            <a href='/#/token/transparency'>Token Transparency</a>
          </p>

          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className='site-collapse-custom-collapse'>
            <Panel header='Network Breakdown' key='1' className='site-collapse-custom-panel'>
              <S.PanelTab>
                <div>
                  <img src={ethereumIcon} alt='network' />
                  <div>
                    <h4>Ethereum Mainnet</h4>
                    <h4>
                      {ethSupply &&
                        ethPercentage &&
                        `${Number(ethSupply).toLocaleString('en-us', {
                          maximumFractionDigits: 2
                        })} NFTFY (${ethPercentage.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}%)`}
                    </h4>
                    <ul>
                      <li>{ethIssued && `Issued: ${ethIssued.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                      <li>{ethBurned && `Burned: ${ethBurned.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                      <li>{ethLocked && `Locked: ${ethLocked.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                    </ul>
                  </div>
                </div>
                <ul>
                  <li>
                    <span>Operator</span>
                    <Tooltip title='Open on Etherscan'>
                      <S.LinkAddress target='_blank' href={`${etherscanAddress}address/${ethereum.operator}`}>
                        {ethereum.operator}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                  <li>
                    <span>Time-Locked Vault</span>
                    <Tooltip title='Open on Etherscan'>
                      <S.LinkAddress target='_blank' href={`${etherscanAddress}address/${ethereum.vault}`}>
                        {ethereum.vault}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                  <li>
                    <span>Multisig</span>
                    <Tooltip title='Open on Etherscan'>
                      <S.LinkAddress target='_blank' href={`${etherscanAddress}address/${ethereum.multisig}`}>
                        {ethereum.multisig}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                </ul>
              </S.PanelTab>
              <S.PanelTab>
                <div>
                  <img src={bscIcon} alt='network' />
                  <div>
                    <h4>Binance Smart Chain</h4>
                    <h4>
                      {bscSupply &&
                        bscPercentage &&
                        `${Number(bscSupply).toLocaleString('en-us', {
                          maximumFractionDigits: 2
                        })} NFTFY (${bscPercentage.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}%)`}
                    </h4>
                    <ul>
                      <li>{bscIssued && `Issued: ${bscIssued.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                      <li>{bscBurned && `Burned: ${bscBurned.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                      <li>{bscLocked && `Locked: ${bscLocked.toNumber().toLocaleString('en-us', { maximumFractionDigits: 2 })}`}</li>
                    </ul>
                  </div>
                </div>
                <ul>
                  <li>
                    <span>Operator</span>
                    <Tooltip title='Open on BSC Scan'>
                      <S.LinkAddress target='_blank' href={`${bscScanAddress}address/${bsc.operator}`}>
                        {bsc.operator}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                  <li>
                    <span>Time-Locked Vault</span>
                    <Tooltip title='Open on BSC Scan'>
                      <S.LinkAddress target='_blank' href={`${bscScanAddress}address/${bsc.vault}`}>
                        {bsc.vault}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                  <li>
                    <span>Multisig</span>
                    <Tooltip title='Open on BSC Scan'>
                      <S.LinkAddress target='_blank' href={`${bscScanAddress}address/${bsc.multisig}`}>
                        {bsc.multisig}
                        <img src={externalLink} alt='clip' />
                      </S.LinkAddress>
                    </Tooltip>
                  </li>
                </ul>
              </S.PanelTab>
            </Panel>
          </Collapse>
        </S.InfoContainer>
        <S.Box>
          <S.Main>
            <ul>
              <li>
                <S.Asset>
                  <h3>Asset</h3>
                  <S.AssetInput
                    value='NFTFY'
                    disabled
                    prefix={<img src={nftfyIcon} alt='NFTFY' />}
                    onClick={() => addNftFyToMetamask(chainId)}
                  />
                </S.Asset>
              </li>
              <li>
                <S.Networks>
                  <div>
                    <h4>From</h4>
                    <div>
                      {isEthereum ? <img src={ethereumIcon} alt='network' /> : <img src={bscIcon} alt='network' />}
                      <span>{isEthereum ? 'Ethereum Mainnet' : 'Binance Smart Chain'}</span>
                    </div>
                  </div>
                  <S.NetworksSwitch title='Switch Network direct on Wallet'>
                    <ArrowRightOutlined />
                  </S.NetworksSwitch>
                  <div>
                    <h4>To</h4>
                    <div>
                      {!isEthereum ? <img src={ethereumIcon} alt='network' /> : <img src={bscIcon} alt='network' />}
                      <span>{!isEthereum ? 'Ethereum Mainnet' : 'Binance Smart Chain'}</span>
                    </div>
                  </div>
                </S.Networks>
              </li>
              <li>
                <S.Amount>
                  <span>{`Amount Available: ${Number(balanceNftfy)}`}</span>
                  <S.AmountInputWrapper>
                    <S.InputNumber
                      size='large'
                      value={amount !== '' ? Number(amount) : undefined}
                      type='number'
                      onChange={handleAmountChange}
                      placeholder='0'
                      min={0}
                      max={Number(balanceNftfy)}
                    />
                    <S.MaxButton onClick={setMaxValue}>MAX</S.MaxButton>
                  </S.AmountInputWrapper>
                  <span>{`Fee: ${Number(amountFee)} NFTFY`}</span>
                  <span>{`You will receive ≈ ${Number(amountNet)} NFTFY`}</span>
                </S.Amount>
              </li>
              <li>
                <S.Destination>
                  <h4>Destination Address</h4>
                  <S.DestinationInput
                    size='small'
                    disabled
                    prefix={<img src={metamaskIcon} alt='Metamask' />}
                    value='0x41f455283d6230A4eE83aE7216FfFb527bBd862A'
                  />
                </S.Destination>
              </li>
              <li>
                <S.Warning>
                  <ExclamationCircleOutlined />
                  <span>
                    You will receive NFTFY at the same wallet address. The transfer takes at least 30 minutes. Please, switch networks in
                    order to check your balance.
                  </span>
                </S.Warning>
              </li>
            </ul>
          </S.Main>
          <S.Action>
            {!account && (
              <S.ActionButton onClick={connectWallet}>
                <span>CONNECT WALLET</span>
              </S.ActionButton>
            )}

            {account && !isRightNetwork && (
              <S.ActionButton disabled>
                <span>WRONG NETWORK</span>
              </S.ActionButton>
            )}

            {isRightNetwork && account && !isApproved && (
              <S.ActionButton loading={loadingApproval} onClick={approveBridge}>
                <span>{`UNLOCK ${isEthereum ? 'ETH' : 'BSC'} BRIDGE`}</span>
              </S.ActionButton>
            )}

            {isRightNetwork && account && isApproved && (
              <S.ActionButton
                disabled={amount === '' || !Number(balanceNftfy) || Number(amount) < Number(amountFee)}
                loading={loadingBridge}
                onClick={executeBridge}>
                <span>{`TRANSFER FUNDS TO ${!isEthereum ? 'ETH' : 'BSC'}`}</span>
              </S.ActionButton>
            )}
          </S.Action>
        </S.Box>
      </S.Container>
    </S.Section>
  )
}
const S = {
  Section: styled.section`
    flex: 0.8;
    max-width: 850px;
    width: 100%;
    margin: 0 auto;
    margin-top: 48px;
    margin-bottom: 32px;
    font-family: ${fonts.nunito};

    @media (max-width: ${viewport.sm}) {
      margin-top: 32px;
    }
  `,
  TitleContent: styled.h1`
    font-family: ${fonts.nunito};
    color: ${colors.gray0};
    font-size: 50px;
    line-height: 130%;
    padding-left: 8px;
    margin-bottom: 50px;
    strong {
      color: ${colors.gray12};
      font-weight: bold;
    }

    @media (max-width: ${viewport.sm}) {
      font-size: 30px;
      padding-left: 0px;
    }
  `,
  Container: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    @media (max-width: ${viewport.sm}) {
      flex-direction: column;
    }
  `,
  LinkAddress: styled.a`
    display: flex;
    flex-direction: row;
    font-weight: normal;
    font-size: 12px;
    line-height: 160%;
    color: ${colors.blue1};
    img {
      margin-left: 5px;
    }
    @media (max-width: ${viewport.sm}) {
      font-size: 16px;
      word-break: break-all;
    }
  `,
  PanelTab: styled.div`
    margin-top: 16px;
    div:first-child {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      img {
        width: 96px;
        margin-right: 21px;
      }
      h4:first-child {
        font-family: ${fonts.nunito};
        font-size: 14px;
        color: ${colors.gray12};
        line-height: 130%;
      }
      h4 {
        font-size: 16px;
      }
      ul {
        margin-top: 8px;
        li {
          font-family: ${fonts.nunito};
          color: ${colors.gray12};
          font-size: 10px;
          line-height: 120%;
        }
      }
    }
    ul {
      margin-top: 16px;
      li {
        span {
          margin: 0;
        }
      }
    }
  `,
  InfoContainer: styled.div`
    display: flex;
    flex-direction: column;
    h3 {
      font-family: ${fonts.nunito};
      font-weight: 400;
      font-size: 20px;
      color: ${colors.gray11};
      margin-bottom: 20px;
    }

    span {
      font-family: ${fonts.nunito};
      font-size: 12px;
      color: ${colors.gray11};
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      img {
        margin-left: 5px;
        cursor: pointer;
        width: 12px;
      }
    }

    p {
      margin-top: 20px;
      font-family: ${fonts.nunito};
      font-size: 12px;
      color: ${colors.gray11};
      line-height: 16px;
      max-width: 400px;
      a {
        margin-left: 2px;
      }
    }

    .ant-collapse {
      margin-top: 32px;
      max-width: 400px;
      .ant-collapse-item {
        background: ${colors.white};
        border: 1px solid ${colors.gray14};
        box-sizing: border-box;
        border-radius: 8px;
      }
    }
    @media (max-width: ${viewport.sm}) {
      margin-bottom: 20px;
    }
  `,
  Box: styled.div`
    background: #fdfdfd;
    max-width: 400px;
    box-sizing: border-box;
    border: 1px solid rgb(222, 222, 222);
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.16);
    border-radius: 8px;

    @media (max-width: ${viewport.sm}) {
      padding: 10px;
      width: 90vw;
    }
  `,
  Header: styled.div`
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${colors.orange};
    font-size: 50px;
    font-weight: 400;
    line-height: 64px;

    @media (max-width: ${viewport.sm}) {
      font-size: 42px;
      line-height: 42px;
      margin-top: 16px;
    }

    > strong {
      color: ${colors.gray12};
      font-weight: 400;
      margin-left: 12px;
    }
  `,
  Title: styled.h3`
    padding: 30px 0;
    font-weight: 400;
    font-size: 26px;
    line-height: 130%;
    text-align: center;
    color: ${colors.gray12};
  `,
  Main: styled.div`
    width: 100%;
    padding: 0 24px;
    margin-top: 24px;

    @media (max-width: ${viewport.sm}) {
      padding: 0 8px;
    }

    ul {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      li {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;

        div {
          flex: 1;
        }

        > span {
          margin: 16px 0 8px;
          font-weight: 400;
          font-size: 10px;
        }
      }
    }
  `,
  Asset: styled.div`
    > h3 {
      font-family: ${fonts.nunito};
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 160%;
      color: #9c9c9c;
      text-align: left;
      margin-bottom: 8px;
    }

    > div {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    small {
      font-size: 10px;
      line-height: 14px;
    }
  `,
  AssetInput: styled(Input)`
    border-radius: 8px;
    margin-bottom: 8px;

    > .ant-input-prefix {
      margin-right: 8px;
    }

    [disabled] {
      font-size: 16px;
      font-weight: 400;
      color: ${colors.gray12};
    }
  `,
  AssetButton: styled(Button)`
    background-color: ${colors.blue1};
    margin-left: 8px;
    border: none;
    border-radius: 8px;

    > span {
      color: ${colors.white};
      font-weight: 400;
    }

    &:hover,
    &:focus,
    &:active {
      background-color: ${colors.blue2};
    }
  `,
  Networks: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.inverted {
      flex-direction: row-reverse;
    }

    > div {
      > h4 {
        font-size: 10px;
        line-height: 14px;
        font-weight: 400;
        text-transform: uppercase;
        color: ${colors.gray12};
        margin-bottom: 8px;
      }

      > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.16);
        border-radius: 8px;
        border: 1px solid #dedede;
        width: 100%;
        height: 128px;

        > img {
          width: 56px;
          height: 56px;
          margin-bottom: 8px;
        }

        > span {
          font-size: 12px;
          line-height: 14px;
          font-weight: 400;
          color: ${colors.gray12};
          text-align: center;
        }
      }
    }
  `,
  NetworksSwitch: styled(Button)`
    background-color: ${colors.gray12};
    border-radius: 50%;
    border: none;
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 8px 0;
    cursor: default;

    &:hover,
    &:focus,
    &:active {
      border: none;
      outline: 0;
      background-color: ${colors.gray12};
    }

    > span {
      color: ${colors.white};
      font-weight: 400;
      font-size: 16px;
      line-height: 14px !important;
    }
  `,
  AddNetworkButton: styled(Button)`
    background: #f3ba2f;
    border-radius: 8px;
    border: none;
    width: 144px;
    margin-bottom: 8px;

    &:hover,
    &:focus,
    &:active {
      background-color: #f3ba2f90;
    }

    > span {
      color: ${colors.white};
      font-size: 14px;
      font-weight: 400;
    }
  `,
  Amount: styled.div`
    display: flex;
    flex-direction: column;
    font-size: 10px;
    font-weight: 400;
    margin-top: 20px;
    margin-bottom: 10px;

    > h4 {
      font-size: 12px;
      font-weight: 400;
    }

    > div {
      margin-bottom: 10px;
    }

    > span {
      font-size: 12px;
      color: #9c9c9c;
      margin-bottom: 10px;
    }

    > span:last-of-type {
      font-size: 12px;
      color: black;
    }
  `,
  InputNumber: styled(InputNumber)`
    border-radius: 8px;
    margin: 8px 12px 8px 0;
    font-weight: 400;
    width: 100%;

    .ant-input-number-input {
      font-weight: 400;
      font-size: 20px;
    }
  `,
  AmountInputWrapper: styled.div`
    width: 100%;
    display: flex;
    align-items: center;
  `,
  MaxButton: styled(Button)`
    border-radius: 8px;
    border: none;
    text-transform: uppercase;
    font-size: 14px;
    padding: 4px 10px;
    background-color: ${colors.blue1};

    > span {
      color: ${colors.white};
    }

    &:hover,
    &:focus,
    &:active {
      background-color: ${colors.blue2};
    }
  `,
  Destination: styled.div`
    display: flex;
    flex-direction: column;
    font-size: 10px;
    font-weight: 400;
    color: ${colors.gray1};

    > h4 {
      font-size: 12px;
      font-weight: 400;
      color: ${colors.gray12};
    }
  `,
  DestinationInput: styled(Input)`
    border-radius: 8px;
    font-size: 12px;
    margin: 8px 0;
    height: 32px;

    [disabled] {
      font-weight: 400;
      color: ${colors.gray12};

      font-size: 12px;
    }

    img {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  `,
  Warning: styled.div`
    display: flex;
    font-size: 10px;
    line-height: 14px;
    align-items: center;

    > .anticon {
      > svg {
        width: 24px;
        height: 24px;
      }
      margin-right: 8px;
      color: #f3ba2f;
    }
  `,
  ConnectWallet: styled(Button)`
    width: 191px;
    height: 45px;
    background: ${colors.gray13};
    border-radius: 8px;
    border: none;
    font-family: ${fonts.nunito};
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: ${colors.gray12};
    &:hover,
    &:focus {
      color: ${colors.white};
      background: ${colors.gray};
    }
  `,
  Action: styled.div`
    width: 100%;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    margin-bottom: 16px;
    span {
      font-family: ${fonts.nunito};
      font-style: normal;
      font-weight: normal;

      color: ${colors.gray12};
    }
    > div {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      min-height: 16px;
      line-height: 20px;
      &:first-child {
        margin-bottom: 24px;
      }
      &:last-child {
        margin-bottom: 32px;
      }
    }

    > button {
      margin-bottom: 8px;
    }

    @media (max-width: ${viewport.sm}) {
      font-size: 16px;
    }
  `,
  ActionButton: styled(Button)`
    width: 100%;
    height: 50px;
    background: linear-gradient(90deg, #fe8367 5.73%, #fe7688 100%);
    border: none;
    border-radius: 8px;
    span {
      color: ${colors.white} !important;
      font-family: ${fonts.nunito};
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
    }
    &:hover,
    &:active,
    &:focus {
      background: #fe836790;
      color: ${colors.white};
    }

    &:disabled {
      &:hover,
      &:active,
      &:focus {
        background-color: #e9e9e9;
        color: #b3b3b3;
      }
      background-color: #e9e9e9;
      color: #b3b3b3;
      span {
        color: #b3b3b3 !important;
      }
    }
  `,
  Message: styled.div`
    font-family: ${fonts.nunito};
    font-style: normal;
    font-weight: normal;
    color: ${colors.gray12};
    text-align: center;
    font-size: 13px;
    padding: 10px 24px;
    line-height: 16px;

    &:last-of-type {
      margin-bottom: 15px;
    }

    > p {
      text-align: left;
      font-size: 10px;
    }
  `
}
