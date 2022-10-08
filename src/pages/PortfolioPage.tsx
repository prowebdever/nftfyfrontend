import { useReactiveVar } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { ClaimModal } from '../components/portfolio/ClaimModal'
import { PortfolioList } from '../components/portfolio/PortfolioList'
import { accountVar, chainIdVar, WalletProvider } from '../graphql/variables/WalletVariable'
import { walletService } from '../services/WalletService'
import { WalletERC20Share } from '../types/WalletTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function PortfolioPage() {
  const [erc20share, setErc20share] = useState<WalletERC20Share[]>([])
  const [loading, setLoading] = useState(true)
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)

  useEffect(() => {
    const getErc20shares = async () => {
      if (account) {
        setLoading(true)
        setErc20share([])
        const nftsV1 = await walletService(WalletProvider.theGraph).getERC20Shares(account, chainId, 1)
        const nftsV2 = await walletService(WalletProvider.theGraph).getERC20Shares(account, chainId, 2)
        setErc20share(nftsV2.concat(nftsV1))
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    getErc20shares()
  }, [account, chainId])

  return (
    <DefaultPageTemplate>
      <PortfolioList erc20share={erc20share} loading={!!loading} account={!!account} />
      <ClaimModal />
    </DefaultPageTemplate>
  )
}
