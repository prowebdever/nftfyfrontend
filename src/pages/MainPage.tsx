import { Button, Timeline } from 'antd'
import React, { useEffect, useState } from 'react'
import ScrollIntoView from 'react-scroll-into-view'
import styled from 'styled-components'
import bgLeft from '../assets/banner/bg_left.jpg'
import bgRight from '../assets/banner/bg_right.jpg'
import closeFaq from '../assets/faq/close.svg'
import openFaq from '../assets/faq/open.svg'
import shape from '../assets/faq/Shape.svg'
import ArrowDownCircle from '../assets/down-circle-o.svg'
import EachImg from '../assets/each.png'
import imgConpectNFT from '../assets/conceptNFT.svg'
import imgWhatsNFT from '../assets/WhatsNFT.svg'
import man1 from '../assets/man2.svg'
import man2 from '../assets/man3.svg'
import man3 from '../assets/man4.svg'
import Altvest from '../assets/altvest.svg'
import Au21Capital from '../assets/au21-capital.svg'
import BlackDragon from '../assets/blackDragon.svg'
import BlockchainBh from '../assets/blockchainBh.svg'
import Blockstar from '../assets/blockstar.svg'
import ChainGuardians from '../assets/chain-guardians.svg'
import ChainRidgeCapital from '../assets/chainRidgeCapital.svg'
import ChainstrideCapital from '../assets/chainstride-capital.svg'
import CryptoDormFund from '../assets/cryptoDormFund.svg'
import Cspdao from '../assets/cspdao.svg'
import DaoCapital from '../assets/dao-capital.svg'
import DecodeCapital from '../assets/decodeCapital.svg'
import DotsCapital from '../assets/dotsCapital.svg'
import DutchCryptoInvestors from '../assets/dutch-crypto-investors.svg'
import EscolaCripto from '../assets/escolaCripto.svg'
import EthGloba from '../assets/ethGloba.svg'
import FollowSeed from '../assets/followSeed.svg'
import Gd10Ventures from '../assets/gd10-ventures.svg'
import Greenleaf from '../assets/greenleaf.svg'
import Inova from '../assets/inova.svg'
import LotusCapital from '../assets/lotus-capital.svg'
import MagnusCapital from '../assets/magnusCapital.svg'
import MoonWhale from '../assets/moonWhale.svg'
import Neo from '../assets/neo.svg'
import Nodeseeds from '../assets/nodeseeds.svg'
import Part1Capital from '../assets/part1Capital.svg'
import PetrockCapital from '../assets/petrock-capital.svg'
import Phoenix from '../assets/phoenix.svg'
import PoolzVentures from '../assets/poolz-ventures.svg'
import tagVentures from '../assets/tagVentures.svg'
import ThreemCapital from '../assets/threemCapital.svg'
import ClaimImg from '../assets/claim.svg'
import FractionalizationImg from '../assets/Fractionalization.svg'
import ProtocolImg from '../assets/protocol.svg'
import RedeemImg from '../assets/Redeem.svg'
import TokeList1 from '../assets/list1.svg'
import TokeList2 from '../assets/list2.svg'
import TokeList3 from '../assets/list3.svg'
import TokeList4 from '../assets/list4.svg'
import TokeList5 from '../assets/list5.svg'
import TokeList6 from '../assets/list6.svg'
import TokenomicsImg from '../assets/tokenomics.svg'
import {Header} from '../components/shared/layout/header/Header'
import { PopupModal } from '../components/shared/PopupModal'
import { popupModalVar } from '../graphql/variables/PopupVariables'
import { colors, fonts, viewport } from '../styles/variables'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function MainPage() {
  const [faq, setFaq] = useState(0)

  const setFaqPage = (key: number) => {
    if (key === faq) {
      setFaq(0)
    } else {
      setFaq(key)
    }
  }

  const redirect = (url: string) => {
    window.location.href = url
  }

  const openModal = () => {
    popupModalVar(true)
  }

  useEffect(() => {
    if (!localStorage.getItem('subscription_modal')) {
      setTimeout(() => {
        openModal()
      }, 10000)
    }
  }, [])

  return (
    <DefaultPageTemplate noMargin fullWidth>
      <S.Container>
        <S.Intro>
          <section>
            <div>
              <p>Helping investors, collectors and artists to Monetize NFTs.</p>
              <ul>
                <li>
                  <S.ButtonExplore onClick={() => redirect('/#/marketplace')}>Marketplace</S.ButtonExplore>
                </li>
                <li>
                  <S.ButtonFractionalize onClick={() => redirect('/#/wallet/fractionalize')}>Fractionalize</S.ButtonFractionalize>
                </li>
              </ul>
            </div>
            <div>
              <iframe
                width='600'
                height='350'
                src='https://www.youtube.com/embed/0WQBMwuaXnU'
                title='YouTube video player'
                frameBorder='0'
                allow='accelerometer;  clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            </div>
          </section>
          <S.Scroll selector='#ExploreDefiCard'>
            <button type='button'>
              <img src={ArrowDownCircle} alt='next' />
            </button>
          </S.Scroll>
        </S.Intro>
        {/*  */}
        <S.WhatIsNftfy>
          <section id='ExploreDefiCard'>
            <div>
              <h1>What is Nftfy?</h1>
              <p>
                We are Nftfy. The first decentralized protocol that enables NFT holders to Fractionalize their Non-Fungible Tokens (NFTs) in
                a trustless and permissionless manner. The highly sophisticated — yet user-friendly — Nftfy platform utilizes smart
                contracts to Fractionalize digital assets into several ERC-20 compliant components while ensuring that each component is
                backed by the NFT itself!
              </p>
              <p>
                Through fractionalization, you can sell a small part of your work or collection. As a side effect, you`ll have more people
                who will own a piece of your NFT, providing the shared ownership of NFTs.
              </p>
            </div>
            <div>
              <img src={imgWhatsNFT} alt='NFT' />
            </div>
          </section>
          <section id='ConceptFractionalize'>
            <div>
              <img src={imgConpectNFT} alt='NFT' />
            </div>
            <div>
              <p>
                The concept of fractionalization will revolutionize the way people create, sell or collect NFTs and is already growing fast
                across the NFT community. This is your opportunity to take advantage of this unique moment and possibly have your NFTs sold,
                or publicize your portfolio to more and more people as a collector or artist.
              </p>
              <p>
                Most NFT`s creators get their art stuck on a marketplace and never get sold. This revolutionary Fractionalization platform
                will empower NFT creators, traders, and speculators like never before.
              </p>
            </div>
          </section>
        </S.WhatIsNftfy>
        {/*  */}
        <S.HowItWorks>
          <section>
            <h1>Here`s How it Works</h1>
            <p>
              Nftfy platform has three easy steps to get your Fractionalized NFT up on the marketplace and trading freely:
              Fractionalization, Redeem, and Claim.
            </p>
            <div id='itWorks'>
              <ul>
                <li>
                  <img src={FractionalizationImg} alt='fraction' />
                  <div>
                    <h2>Fractionalization</h2>
                    <p>
                      Simply connect your wallet to the Nftfy platform and select your NFT to Fractionalize. From there, you just need to
                      set the Exit Price that someone needs to pay to extract the NFT.
                    </p>
                    <p>
                      Once the transaction is approved, the NFT is transferred from your wallet to the smart contract. You receive 1,000,000
                      ERC20 tokens representing Fractions of your NFT, effectively turning your NFT into its own market!
                    </p>
                  </div>
                </li>
                <li>
                  <img src={RedeemImg} alt='Redeem' />
                  <div>
                    <h2>Redeem</h2>
                    <p>
                      If someone wants to buy the whole NFT, this person must redeem the NFT by paying the predetermined Exit Price. This
                      payment can be issued with any mix of Fractions and coins to reach the price. After that, the NFT is transferred to
                      the buyer’s wallet and the amount paid is stored in the smart contract’s vault.
                    </p>
                  </div>
                </li>
                <li>
                  <img src={ClaimImg} className='img-claim' alt='claim' />
                  <div>
                    <h2>Claim</h2>
                    <p>What if someone buys the whole NFT, and you still hold Fractions of it?</p>
                    <p>
                      All you have to do is to Claim your participation. The protocol will exchange your Fractions at the click of a button
                      for a proportional amount of coins stored in the smart contract`s vault.
                    </p>
                  </div>
                </li>
              </ul>
              <div className='img-protocol'>
                <img src={ProtocolImg} alt='protocol' />
              </div>
            </div>
          </section>
        </S.HowItWorks>
        {/*  */}
        <S.Avatars>
          <section>
            <h1>Nftfy is perfect for</h1>
            <p>
              You can quickly fractionalize NFTs without requiring authorization from anyone, since it is done automatically and
              decentralized, eliminating intermediaries and saving time and effort.
            </p>

            <ul>
              <li>
                <img src={man1} alt='Digital Artists' />
                <h2>Digital Artists</h2>
                <span>
                  Freedom and independence to sell their NFTs in parts, making it easier to monetize their work, while being widely
                  recognized in the community. By using Nftfy as an artist, you can keep participation in your art piece and follow a fair
                  and real-time valuation of your Fractions.
                </span>
              </li>
              <li>
                <img src={man2} alt='Entrepreneurs' />
                <h2>Collectors and Entrepreneurs</h2>
                <span>
                  Liquidity to buy and sell Fractions of an NFT for a fair price, increasing your portfolio variety. By using Nftfy as a
                  collector, you can hold a percentage of the rarest and most expensive NFTs.
                </span>
              </li>
              <li>
                <img src={man3} alt='Speculators' />
                <h2>Speculators</h2>
                <span>
                  Trade NFT Fractions, provide liquidity, farm yields, share risks, and make arbitrage in marketing opportunities. The
                  concept of Fractionalization means that you don`t need to buy an entire NFT at once, allowing you to minimize the risk of
                  investment. By using Nftfy as a speculator, you can trade Fractions and seek market opportunities, besides being able to
                  enjoy all the DeFi features.
                </span>
              </li>
            </ul>
          </section>
        </S.Avatars>
        {/*  */}
        <S.EachNFT>
          <section>
            <div>
              <img src={EachImg} alt='Each NFT' />
            </div>
            <div>
              <h1>Each NFT is an entire new market created</h1>
              <p>
                Build a liquidity market for your Fractions and make it public. Perform an Initial dex Offering using Balancer`s Liquidity
                Bootstrapping Pools (LBPs). Trade Fractions instantly!
              </p>
              <S.ButtonAction onClick={() => redirect('/#/marketplace')}>CLICK HERE TO ENTER THE PLATFORM</S.ButtonAction>
            </div>
          </section>
        </S.EachNFT>
        {/*  */}
        <S.Tokenomics>
          <section id='tokenomics'>
            <div>
              <h1>Powerful Tokenomics</h1>
              <p>
                Nftfy Tokenomics is designed to help all the users to launch a complete IDO and deliver Fractions with Liquidity to the open
                market.
              </p>
              <p>
                The protocol counts with the strongest DeFi services, such as AMM, Liquidity Mining, Yield Farming, Airdrops, DAO Treasury.
                Everything to benefit the individual user and the entire ecosystem.
              </p>
            </div>
            <div>
              <img src={TokenomicsImg} alt='tokenomics' />
            </div>
          </section>
          <section id='list-tokenomics'>
            <ul>
              <li>
                <img src={TokeList1} alt='icon' />
                <h3>Fractionalize</h3>
              </li>
              <li>
                <img src={TokeList2} alt='icon' />
                <h3>AMM Boost Liquidity</h3>
              </li>
              <li>
                <img src={TokeList3} alt='icon' />
                <h3>Airdrops</h3>
              </li>
              <li>
                <img src={TokeList4} alt='icon' />
                <h3>Liquidity Mining</h3>
              </li>
              <li>
                <img src={TokeList5} alt='icon' />
                <h3>Rewards</h3>
              </li>
              <li>
                <img src={TokeList6} alt='icon' />
                <h3>Burning Mechanism</h3>
              </li>
            </ul>
            <S.ButtonAction onClick={() => redirect('/#/buy')}>CLICK HERE TO BUY NFTFY TOKEN</S.ButtonAction>
          </section>
        </S.Tokenomics>
        {/*  */}
        <S.RoadMap>
          <section>
            <h1>Road Map</h1>
            <h4>History and milestones</h4>
            <S.TimeLine>
              <li />
              <li>
                <h2>August</h2>
                <h3>2020</h3>
                <span />
                <p>
                  Theorical
                  <br />
                  documentation
                </p>
              </li>
              <li />
              <li>
                <h2>November</h2>
                <h3>2020</h3>
                <span />
                <p>DApp on Mainnet</p>
              </li>
              <li />
              <li>
                <h2>December</h2>
                <h3>2020</h3>
                <span />
                <p>Onboarding Team</p>
              </li>
              <li />
              <li>
                <h2>April/May</h2>
                <h3>2021</h3>
                <span />
                <p>
                  Smart Contracts Audit
                  <br />
                  NFTFY Token Release
                  <br />
                  NFT Fractions Marketplace
                  <br />
                  Farming
                </p>
              </li>
              <li />
            </S.TimeLine>
            <h4 className='divisor'>Long Term Vision</h4>
            <S.TimeLine>
              <li />
              <li>
                <h2>Q2</h2>
                <h3>2021</h3>
                <span />
                <p>
                  DAO Treasury
                  <br />
                  Management Grants
                  <br />
                  New Features Launching
                </p>
              </li>
              <li />
              <li>
                <h2>Q3</h2>
                <h3>2021</h3>
                <span />
                <p>
                  Balancer Complete
                  <br />
                  Integration
                  <br />
                  Launchpad
                  <br />
                  LBP Management
                </p>
              </li>
              <li />
              <li>
                <h2>Q4</h2>
                <h3>2021</h3>
                <span />
                <p>
                  Money Legos
                  <br />
                  DeFi Connections
                  <br />
                  NFT Platforms
                  <br />
                  Funding DeFi
                  <br />
                  Projects
                </p>
              </li>
              <li />
              <li>
                <h2>Q2</h2>
                <h3>2022</h3>
                <span />
                <p>Real World Assets</p>
              </li>
              <li />
            </S.TimeLine>
          </section>
        </S.RoadMap>
        {/*  */}
        <S.RoadMapMobile>
          <section>
            <h1>Road Map</h1>
            <h4>History and milestones</h4>
            <Timeline>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    August
                    <strong>2020</strong>
                  </h2>
                  <span>Theorical Documentation</span>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    November
                    <strong>2020</strong>
                  </h2>
                  <span>DApp on Mainnet</span>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    December
                    <strong>2020</strong>
                  </h2>
                  <span>Onboarding Team</span>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    April/May
                    <strong>2021</strong>
                  </h2>
                  <span>
                    Smart Contracts Audit
                    <br />
                    NFTFY Release
                    <br />
                    Marketplace
                    <br />
                    Farming
                  </span>
                </div>
              </Timeline.Item>
            </Timeline>
            <h4>History and milestones</h4>
            <Timeline>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    Q2
                    <strong>2021</strong>
                  </h2>
                  <p>
                    <span>DAO Treasury</span>
                  </p>
                  <p>
                    <span>Management Grants</span>
                  </p>
                  <p>
                    <span>New Features</span>
                  </p>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    Q3
                    <strong>2021</strong>
                  </h2>
                  <span>
                    Balancer complete integration
                    <br />
                    Launchpad
                    <br />
                    LBP Management
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    Q4
                    <strong>2021</strong>
                  </h2>
                  <span>
                    Money Legos
                    <br />
                    DeFi Connections
                    <br />
                    NFT platforms funding
                    <br />
                    DeFi projects
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item>
                <div className='item-timeline'>
                  <h2>
                    Q2
                    <strong>2022</strong>
                  </h2>
                  <span>Real World Assets</span>
                </div>
              </Timeline.Item>
            </Timeline>
          </section>
        </S.RoadMapMobile>
        {/*  */}
        <S.Partnerships>
          <section>
            <h1>Partnerships</h1>
            <ul>
              <li>
                <img src={MoonWhale} alt='MoonWhale' />
              </li>
              <li>
                <img src={Gd10Ventures} alt='GD10 Ventures' />
              </li>
              <li>
                <img src={MagnusCapital} alt='Magnus Capital' />
              </li>
              <li>
                <img src={ThreemCapital} alt='Threem Capital' />
              </li>
              <li>
                <img src={Au21Capital} alt='AU21 Capital' />
              </li>
              <li>
                <img src={PetrockCapital} alt='Petrock Capital' />
              </li>
              <li>
                <img src={LotusCapital} alt='Lotus Capital' />
              </li>
              <li>
                <img src={ChainGuardians} alt='Chain Guardians' />
              </li>
              <li>
                <img src={PoolzVentures} alt='Poolz Ventures' />
              </li>
              <li>
                <img src={Greenleaf} alt='greenleaf' />
              </li>
              <li>
                <img src={ChainRidgeCapital} alt='Chain Ridge Capital' />
              </li>
              <li>
                <img src={Part1Capital} alt='Part 1 Capital' />
              </li>
              <li>
                <img src={tagVentures} alt='Tag Ventures' />
              </li>
              <li>
                <img src={Blockstar} alt='Blockstar' />
              </li>
              <li>
                <img src={FollowSeed} alt='Follow the Seed' />
              </li>
              <li>
                <img src={DotsCapital} alt='Dots Capital' />
              </li>
              <li>
                <img src={CryptoDormFund} alt='Crypto Dorm Fund' />
              </li>
              <li>
                <img src={ChainstrideCapital} alt='Chainstride Capital' />
              </li>
              <li>
                <img src={Phoenix} alt='Phoenix.io' />
              </li>
              <li>
                <img src={Altvest} alt='Altvest' />
              </li>
              <li>
                <img src={Nodeseeds} alt='Nodeseeds' />
              </li>
              <li>
                <img src={BlackDragon} alt='Black Dragon' />
              </li>
              <li>
                <img src={Cspdao} alt='CSPDAO' />
              </li>
              <li>
                <img src={DaoCapital} alt='DAO Capital' />
              </li>
              <li>
                <img src={DutchCryptoInvestors} alt='Dutch Crypto Investors' />
              </li>
              <li>
                <img src={EscolaCripto} alt='Escola Cripto' />
              </li>
              <li>
                <img src={BlockchainBh} alt='Blockchain Bh' />
              </li>
              <li>
                <img src={Neo} alt='NEO Ventures' />
              </li>
              <li>
                <img src={Inova} alt='Inova' />
              </li>
              <li>
                <img src={EthGloba} alt='ETH Global' />
              </li>
              <li>
                <img src={DecodeCapital} alt='Decode Capital' />
              </li>
            </ul>
          </section>
        </S.Partnerships>
        {/*  */}
        <S.FAQ>
          <section>
            <h1>FREQUENTLY ASKED QUESTION</h1>

            <ul>
              <li>
                <S.AreaClick onClick={() => setFaqPage(1)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>What is Nftfy?</span>
                    </div>
                    {faq === 1 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 1 ? (
                    <div className='content'>
                      <span>
                        The first decentralized protocol that enables NFT holders to Fractionalize their Non-Fungible Tokens (NFTs) in a
                        trustless and permissionless manner. The highly sophisticated — yet user-friendly — Nftfy platform utilizes smart
                        contracts to Fractionalize digital assets into several ERC-20 compliant components while ensuring that each
                        component is backed by the NFT itself!
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>

              <li>
                <S.AreaClick onClick={() => setFaqPage(2)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>What is Fractionalization of NFTs?</span>
                    </div>
                    {faq === 2 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 2 ? (
                    <div className='content'>
                      <span>
                        Fractionalization is the process responsible for dividing Non-Fungible Tokens (NFTs) into several ERC20 compliant
                        Fractions, allowing the connection between NFT and DeFi ecosystems.
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>

              <li>
                <S.AreaClick onClick={() => setFaqPage(3)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>How can I start Fractionalizing NFTs?</span>
                    </div>
                    {faq === 3 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 3 ? (
                    <div className='content'>
                      <span>
                        Click on the “Fractionalize” button to see all your NFTs in your wallet. Select one of them, set the Exit Price and
                        press “Fractionalize”. Your NFT will be transferred to the smart contract and you will receive ERC20 compliant
                        Fractions fully backed by this NFT. For a more detailed explanation, look at this simple
                        <S.LinkSimple target='_blank' href='https://docs.nftfy.org/getting-started/how-to-fractionalize'>
                          user`s guide
                        </S.LinkSimple>
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>

              <li>
                <S.AreaClick onClick={() => setFaqPage(4)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>Do I need to have special skills in order to do this?</span>
                    </div>
                    {faq === 4 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 4 ? (
                    <div className='content'>
                      <span>
                        No, Nftfy is a very user-friendly platform, so artists, collectors and investors can Fractionalize their NFTs and
                        trade Fractions in the marketplace in a simple and easy way
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>

              <li>
                <S.AreaClick onClick={() => setFaqPage(5)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>Why should I fractionalize my NFT?</span>
                    </div>
                    {faq === 5 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 5 ? (
                    <div className='content'>
                      <span>
                        You can explore the maximum value of your NFT, while allowing its shared ownership. Once you Fractionalize an NFT,
                        you will receive ERC20 compliant Fractions of it. In that way, you can sell these Fractions in a private way as an
                        easy way to speed up the monetization of your asset. In addition, you can create your own Initial Dex Offering by
                        launching your Fractions in the open market with fair and real-time pricing.
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>

              <li>
                <S.AreaClick onClick={() => setFaqPage(6)}>
                  <div className='card'>
                    <div>
                      <img src={shape} alt='shape' />
                      <span>What is the NFTFY Token Address?</span>
                    </div>
                    {faq === 6 ? <img src={closeFaq} alt='close' /> : <img src={openFaq} alt='open' />}
                  </div>
                  {faq === 6 ? (
                    <div className='content'>
                      <span>0xbf6ff49ffd3d104302ef0ab0f10f5a84324c091c</span>
                    </div>
                  ) : (
                    <></>
                  )}
                </S.AreaClick>
              </li>
            </ul>
          </section>
        </S.FAQ>
        {/*  */}
        <S.Banner>
          <img src={bgLeft} alt='bg' />
          <div>
            <h1>START NOW</h1>
            <p>Fractionalizing your NFTs is a revolutionary way to bring liquidity and increase monetization on your Non-fungible Token.</p>
            <p>
              In order to start the fractionalization process, all you need to do is click on the button below and follow the simple steps.
            </p>
            <S.ButtonAction onClick={() => redirect('/#/marketplace')}>CLICK HERE TO START</S.ButtonAction>
          </div>
          <img src={bgRight} alt='bg' />
        </S.Banner>
        <PopupModal />
      </S.Container>
    </DefaultPageTemplate>
  )
}

export const S = {
  Container: styled.div`
    flex: 1;
    min-height: calc(100vh - 96px);
    display: flex;
    flex-direction: column;
  `,
  Header: styled(Header)``,
  Scroll: styled(ScrollIntoView)`
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      border: none;
      border-radius: 50%;
      padding: 15px;
      background-color: ${colors.white};
      cursor: pointer;
    }
    @media (max-width: ${viewport.md}) {
      margin-bottom: -20px;
    }
  `,
  Intro: styled.div`
    width: 100%;
    height: 672px;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%), #f5f5f5;
    section {
      margin: 0 auto;
      margin-top: 140px;
      margin-bottom: 140px;
      width: 100%;
      max-width: ${viewport.xl};
      display: grid;
      grid-template-columns: 1fr 1fr;
      @media (max-width: ${viewport.lg}) {
        padding: 20px;
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        align-self: center;
      }
      div:nth-child(1) {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        align-self: center;
        p {
          font-family: ${fonts.nunito};
          font-style: normal;
          font-weight: 400;
          font-size: 52px;
          color: ${colors.gray2};
          padding-bottom: 48px;
        }
        ul {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          li {
            margin-right: 24px;
            a {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 28px;
            }
          }
        }
        @media (max-width: ${viewport.lg}) {
          p {
            font-size: 32px;
            text-align: center;
          }
          ul {
            width: 100%;
            justify-content: space-around;
            li {
              margin: 0px;
            }
          }
        }
      }
      div:nth-child(2) {
        > iframe {
          border-radius: 8px !important;
        }
        @media (max-width: ${viewport.lg}) {
          margin-bottom: 48px;
          > iframe {
            width: 90vw;
          }
        }
      }
    }
    @media (max-width: ${viewport.lg}) {
      height: auto;
      section {
        margin-top: 48px;
        margin-bottom: 40px;
      }
    }
  `,
  WhatIsNftfy: styled.div`
    width: 100%;
    margin-top: 90px;
    @media (max-width: ${viewport.lg}) {
      margin-top: 48px;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      display: grid;
      grid-template-columns: 1fr 1fr;
      @media (max-width: ${viewport.lg}) {
        padding: 20px;
      }
      div {
        h1 {
          font-family: ${fonts.nunito};
          font-weight: 400;
          font-size: 40px;
          color: ${colors.gray6};
          padding-bottom: 48px;
        }
        p {
          font-family: ${fonts.nunito};
          font-weight: normal;
          font-size: 16px;
          line-height: 20px;
          color: ${colors.gray2};
          padding-bottom: 20px;
        }
        @media (max-width: ${viewport.lg}) {
          padding-bottom: 48px;
          h1 {
            text-align: center;
            font-size: 32px;
          }
          img {
            width: 298px;
            height: auto;
          }
        }
      }
    }

    #ExploreDefiCard {
      div:nth-child(2) {
        text-align: center;
      }
      @media (max-width: ${viewport.lg}) {
        display: flex;
        flex-direction: column;
      }
    }
    #ConceptFractionalize {
      div:nth-child(2) {
        display: flex;
        flex-direction: column;
        align-self: center;
      }
      @media (max-width: ${viewport.lg}) {
        div:nth-child(1) {
          text-align: center;
        }
        display: flex;
        flex-direction: column-reverse;
      }
    }
  `,
  HowItWorks: styled.div`
    width: 100%;
    margin-top: 90px;
    padding-bottom: 90px;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%), #f5f5f5;
    @media (max-width: ${viewport.lg}) {
      margin-top: 48px;
      padding-bottom: 48px;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      @media (max-width: ${viewport.lg}) {
        padding: 20px;
      }
      h1 {
        font-family: ${fonts.nunito};
        font-weight: 400;
        font-size: 40px;
        color: ${colors.gray6};
        text-align: center;
        padding-top: 48px;
        padding-bottom: 16px;
      }
      p {
        font-family: ${fonts.nunito};
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        color: ${colors.gray2};
        text-align: center;
      }
      #itWorks {
        margin-top: 48px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media (max-width: ${viewport.lg}) {
          display: flex;
          flex-direction: column-reverse;
        }
        ul {
          li {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding-bottom: 25px;
            img {
              width: 100px;
              height: auto;
              padding-right: 20px;
            }
            .img-claim {
              padding-left: 30px;
              padding-right: 30px;
            }
            div {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              h2 {
                font-family: ${fonts.nunito};
                font-style: normal;
                font-weight: 400;
                font-size: 20px;
                line-height: 26px;
                padding-bottom: 16px;
                color: ${colors.orange};
              }
              p {
                font-family: ${fonts.nunito};
                font-weight: normal;
                font-size: 16px;
                line-height: 20px;
                padding-bottom: 20px;
                color: ${colors.gray2};
                text-align: left;
              }
            }

            @media (max-width: ${viewport.lg}) {
              flex-direction: column;
              text-align: center;
              justify-content: center;
              align-items: center;

              img {
                padding-right: 0px;
                padding-bottom: 24px;
              }

              div {
                h2 {
                  padding-bottom: 24px;
                }
              }
            }
          }
        }
        .img-protocol {
          display: flex;
          align-items: center;
          text-align: center;
          img {
            max-width: 650px;
            padding-left: 60px;
          }
          @media (max-width: ${viewport.lg}) {
            text-align: center;
            justify-content: center;
            img {
              width: 235px;
              height: auto;
              padding-bottom: 48px;
              padding-left: 0px;
            }
          }
        }
      }
    }
  `,
  Avatars: styled.div`
    width: 100%;
    margin-bottom: 90px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 45%, #ffffff 45%), #f5f5f5;
    @media (max-width: ${viewport.lg}) {
      margin-bottom: 48px;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};

      h1 {
        font-family: ${fonts.nunito};
        font-weight: 400;
        font-size: 40px;
        color: ${colors.gray6};
        text-align: center;
        padding-bottom: 24px;
      }
      p {
        font-family: ${fonts.nunito};
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        color: ${colors.gray2};
        text-align: center;
      }

      ul {
        padding-top: 48px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        @media (max-width: ${viewport.lg}) {
          display: flex;
          flex-direction: column;
        }

        li {
          display: flex;
          align-items: center;
          flex-direction: column;
          padding: 24px;
          h2 {
            font-weight: 600;
            font-size: 22px;
            line-height: 32px;
            color: ${colors.orange};
            text-align: center;
            padding-bottom: 24px;
          }
          span {
            font-weight: normal;
            font-size: 15px;
            line-height: 20px;
            color: ${colors.gray11};
            text-align: center;
          }
        }
      }
      @media (max-width: ${viewport.lg}) {
        padding: 20px;

        h1 {
          margin-top: 0px;
          font-size: 32px;
        }
        ul {
          li {
            padding: 0px;
          }
        }
      }
    }
  `,
  EachNFT: styled.div`
    width: 100%;
    /* padding-bottom: 90px; */
    @media (max-width: ${viewport.lg}) {
      padding-bottom: 48px;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      display: grid;
      grid-template-columns: 1fr 1fr;
      div {
        img {
          max-width: 750px;
        }
        h1 {
          font-family: ${fonts.nunito};
          font-weight: 400;
          font-size: 40px;
          color: ${colors.gray6};
          padding-bottom: 48px;
        }
        p {
          font-weight: normal;
          font-size: 20px;
          color: ${colors.gray11};
          padding-bottom: 48px;
        }
        a {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 28px;
        }
      }
      div:nth-child(2) {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-self: center;
      }
      @media (max-width: ${viewport.lg}) {
        display: flex;
        flex-direction: column;
        padding: 20px;
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          img {
            width: 250px;
            height: auto;
            padding-bottom: 48px;
            z-index: 100;
          }
          h1 {
            font-size: 32px;
          }
        }
      }
    }
  `,
  Tokenomics: styled.div`
    width: 100%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 100%), #f5f5f5;
    padding-top: 140px;
    padding-bottom: 90px;
    @media (max-width: ${viewport.md}) {
      padding-top: 0px;
      padding-bottom: 48px;
    }
    #tokenomics {
      margin: 0 auto;
      max-width: ${viewport.xl};
      display: grid;
      grid-template-columns: 1fr 1fr;

      div {
        img {
          max-width: 800px;
        }
        h1 {
          font-family: ${fonts.nunito};
          font-weight: 400;
          font-size: 36px;
          color: ${colors.gray6};
          padding-bottom: 48px;
        }
        p {
          font-weight: normal;
          font-size: 20px;
          color: ${colors.gray11};
          padding-bottom: 20px;
        }
      }
      @media (max-width: ${viewport.lg}) {
        display: flex;
        flex-direction: column;
        padding: 20px;
        div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          img {
            width: 250px;
            height: auto;
          }
          h1 {
            font-size: 30px;
            text-align: center;
          }
          p {
            text-align: center;
          }
        }
      }
    }
    #list-tokenomics {
      margin: 0 auto;
      text-align: -webkit-center;
      max-width: ${viewport.xl};
      padding-top: 48px;
      a {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 48px;
      }
      ul {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        li {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          img {
            padding-bottom: 26px;
          }
          h3 {
            font-weight: 400;
            font-size: 20px;
            line-height: 32px;
            min-height: 64px;
            color: ${colors.gray2};
          }
        }
      }
      @media (max-width: ${viewport.lg}) {
        padding: 20px;
        ul {
          grid-template-columns: 1fr 1fr 1fr;
          li {
            img {
              width: 36px;
              height: auto;
              padding-bottom: 10px;
            }
            h3 {
              font-size: 12px;
            }
            padding-bottom: 26px;
          }
        }
      }
    }
  `,
  RoadMap: styled.div`
    width: 100%;
    padding-bottom: 90px;
    background: #f5f5f5;
    @media (max-width: ${viewport.md}) {
      display: none;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      h1 {
        font-style: normal;
        font-weight: 400;
        font-size: 40px;
        color: ${colors.gray6};
        text-align: center;
        padding-bottom: 48px;
        padding-top: 48px;
      }
      h4 {
        font-weight: 400;
        font-size: 30px;
        line-height: 38px;
        color: ${colors.gray6};
        text-align: center;
      }
      .divisor {
        padding-top: 140px;
      }
    }
  `,
  RoadMapMobile: styled.div`
    width: 100%;
    background: #f5f5f5;
    display: none;
    @media (max-width: ${viewport.md}) {
      display: flex;
    }
    section {
      width: 100%;
      padding: 20px;
      h1 {
        font-style: normal;
        font-weight: 400;
        font-size: 32px;
        color: ${colors.gray6};
        text-align: center;
        padding-bottom: 48px;
        padding-top: 48px;
        text-align: center;
      }
      h4 {
        font-weight: 400;
        font-size: 16px;
        line-height: 38px;
        color: ${colors.gray6};
        text-align: center;
        padding-bottom: 48px;
      }

      .ant-timeline-item-tail {
        margin-left: 5px;
      }
      .ant-timeline-item-head {
        width: 20px;
        height: 20px;
        background: ${colors.gray2};
        border-color: ${colors.orange};
        color: ${colors.orange};
      }
      .secundTitleRoad {
        margin-bottom: 30px;
      }
      .item-timeline {
        display: flex;
        flex-direction: column;
        h2 {
          color: ${colors.orange};
          strong {
            color: ${colors.gray2};
            margin-left: 5px;
          }
          font-weight: 600;
          font-size: 20px;
          line-height: 28px;
        }
        span {
          font-weight: 400;
          font-size: 16px;
          line-height: 22px;
          color: ${colors.gray2};
        }
      }
    }
  `,
  TimeLine: styled.ul`
    margin-top: 48px;
    display: flex;
    flex-direction: row;
    align-items: center;
    li:nth-child(odd) {
      background: ${colors.gray5};
      margin-top: -25px;
      width: 200px;
      height: 1px;
    }
    li:nth-child(even) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-left: -40px;
      margin-right: -40px;
      h2 {
        font-weight: bold;
        font-size: 24px;
        line-height: 32px;
        text-align: center;
        color: ${colors.orange};
      }
      h3 {
        font-weight: bold;
        font-size: 24px;
        line-height: 32px;
        text-align: center;
        color: ${colors.gray2};
      }
      span {
        width: 23px;
        height: 23px;
        background: ${colors.gray2};
        border-radius: 50%;
        margin: 20px 0px 20px 0px;
        cursor: pointer;
        transition: background-color 0.5s ease;
        &:hover {
          background: none;
          border: 2px solid ${colors.orange};
        }
      }
      p {
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        color: ${colors.gray2};
        text-align: center;
        height: 88px;
      }
    }
    @media (max-width: ${viewport.xl}) {
      flex-direction: column;
      li:nth-child(odd) {
        display: none;
      }
      li:nth-child(even) {
        margin-bottom: 30px;
      }
    }
  `,
  Partnerships: styled.div`
    width: 100%;
    padding-top: 140px;
    padding-bottom: 90px;
    @media (max-width: ${viewport.md}) {
      padding-top: 48px;
      padding-bottom: 48px;
    }
    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      h1 {
        font-family: ${fonts.nunito};
        font-weight: 400;
        font-size: 40px;
        color: ${colors.gray6};
        padding-bottom: 48px;
        text-align: center;
      }

      ul {
        flex: 1;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        @media (max-width: ${viewport.xl}) {
          grid-template-columns: 1fr 1fr 1fr;
        }
        @media (max-width: ${viewport.sm}) {
          grid-template-columns: 1fr 1fr;
        }
        li {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          margin: 30px 0px;
        }
      }
      @media (max-width: ${viewport.xl}) {
        ul {
          justify-content: center;
          li {
            img {
              max-width: 120px;
              max-height: 70px;
            }
          }
        }
      }
      @media (max-width: ${viewport.md}) {
        h1 {
          font-size: 32px;
        }
      }
    }
  `,
  FAQ: styled.div`
    width: 100%;
    padding-top: 90px;
    padding-bottom: 90px;
    background: #f5f5f5;
    @media (max-width: ${viewport.md}) {
      padding-top: 48px;
      padding-bottom: 48px;
    }

    section {
      margin: 0 auto;
      max-width: ${viewport.xl};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      h1 {
        font-family: ${fonts.nunito};
        font-weight: 400;
        font-size: 40px;
        color: ${colors.gray6};
        padding-bottom: 48px;
        text-align: center;
        @media (max-width: ${viewport.md}) {
          font-size: 32px;
        }
      }
      ul {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        @media (max-width: ${viewport.md}) {
          padding: 20px;
        }
        li {
          width: 100%;
          max-width: 880px;
          height: auto;
          min-height: 80px;
          margin-bottom: 8px;
          background: #ffffff;
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.05);
          border-radius: 16px;
          @media (max-width: ${viewport.md}) {
            padding: 0px;
          }
          transform: scaleY(1);
          transition: all 500ms ease;
          .card {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 30px;
            @media (max-width: ${viewport.md}) {
              padding: 10px;
            }
            div {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              img {
                padding-right: 10px;
              }
              span {
                font-weight: 400;
                font-size: 16px;
                line-height: 24px;
                color: ${colors.gray2};
              }
            }
            img {
              padding-left: 10px;
            }
          }
          .content {
            padding: 30px;
            padding-top: 26px;
            span {
              font-weight: normal;
              font-size: 16px;
              line-height: 20px;
              color: ${colors.gray11};
            }
          }
        }
      }
    }
  `,
  Banner: styled.div`
    width: 100%;
    height: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: ${colors.black1};
    @media (max-width: ${viewport.xl}) {
      padding: 20px;
    }
    img {
      height: 500px;
      width: auto;
    }
    div {
      display: flex;
      flex-direction: column;
      align-items: center;
      h1 {
        font-weight: 400;
        font-size: 52px;
        line-height: 70px;

        font-family: ${fonts.nunito};
        color: ${colors.orange};
        text-align: center;
        @media (max-width: ${viewport.xl}) {
          padding: 20px;
        }
      }
      p {
        font-family: ${fonts.nunito};
        font-weight: 400;
        font-size: 20px;
        line-height: 26px;
        text-align: center;

        color: ${colors.white};
        margin-bottom: 20px;
      }
      a {
        margin-top: 48px;
        margin-bottom: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 28px;
      }
    }
    @media (max-width: ${viewport.md}) {
      div {
        h1 {
          padding-top: 48px;
          padding-bottom: 38px;
        }
        p {
          font-size: 16px !important;
        }
      }
      img {
        max-width: 400px;
      }
    }

    @media (max-width: ${viewport.xl}) {
      div {
        h1 {
          font-size: 42px !important;
        }
        p {
          font-size: 16px !important;
        }
      }
      img {
        display: none;
      }
    }

    @media (max-width: ${viewport.xxl}) {
      img {
        max-width: 400px;
      }
    }
  `,
  ButtonExplore: styled(Button)`
    width: 224px;
    height: 54px;
    border: 1px solid ${colors.blue1};
    box-sizing: border-box;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: ${colors.gray11};
    @media (max-width: ${viewport.md}) {
      width: 150px;
      height: 40px;
    }
  `,
  ButtonFractionalize: styled(Button)`
    width: 224px;
    height: 54px;
    border: none;
    box-sizing: border-box;
    border-radius: 8px;
    background: ${colors.blue1};
    color: ${colors.white};
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    @media (max-width: ${viewport.sm}) {
      width: 150px;
      height: 40px;
    }

    &:hover,
    &:focus,
    &:active {
      background: ${colors.blue2};
      color: ${colors.white};
    }
  `,
  ButtonAction: styled(Button)`
    width: 100%;
    max-width: 400px;
    height: 54px;
    border: none;
    box-sizing: border-box;
    border-radius: 8px;
    background: ${colors.blue1};
    color: ${colors.white};
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 20px;
    margin-top: 40px;
    @media (max-width: ${viewport.sm}) {
      width: 100%;
      height: 40px;
      font-size: 14px;
    }

    &:hover,
    &:focus,
    &:active {
      background: ${colors.blue2};
      color: ${colors.white};
    }
  `,
  LinkSimple: styled.a`
    padding-right: 3px;
  `,
  AreaClick: styled.a`
    width: 100%;
    height: 100%;
    padding: 30px;
  `
}
