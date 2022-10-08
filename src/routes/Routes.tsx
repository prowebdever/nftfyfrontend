import { useReactiveVar } from '@apollo/client'
import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import { Header } from '../components/shared/layout/header/Header'
import { getFeatureToggleByChainId } from '../featureToggle'
import { ThemeProviderEnum, themeVar } from '../graphql/variables/Shared'
import { chainIdVar } from '../graphql/variables/WalletVariable'
import { Page404 } from '../pages/Page404'

const BoxDetailsPageV2 = lazy(() => import('../pages/BoxDetailsPageV2'))
const BoxesPage = lazy(() => import('../pages/BoxesPage'))
const BridgePage = lazy(() => import('../pages/BridgePage'))
const BuyPage = lazy(() => import('../pages/BuyPage'))
const ClaimPage = lazy(() => import('../pages/ClaimPage'))
const DisclaimerPage = lazy(() => import('../pages/DisclaimerPage'))
// const EditUserProfilePage = lazy(() => import('../pages/EditUserProfilePage'))
const FarmPage = lazy(() => import('../pages/FarmPage'))
// const WalletCollectiveBuyDetailsPage = lazy(() => import('../pages/WalletCollectiveBuyDetailsPage'))
const FractionalizeDetailsPage = lazy(() => import('../pages/FractionalizeDetailsPage'))
const FractionalizePage = lazy(() => import('../pages/FractionalizePage'))
const MainPage = lazy(() => import('../pages/MainPage'))
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'))
const MarketplaceDetailsPage = lazy(() => import('../pages/MarketplaceDetailsPage'))
const MintBox = lazy(() => import('../pages/MintBox'))
const MintPage = lazy(() => import('../pages/MintPage'))
const PortfolioPage = lazy(() => import('../pages/PortfolioPage'))
const TransparencyPage = lazy(() => import('../pages/TransparencyPage'))
// const UserProfilePage = lazy(() => import('../pages/UserProfilePage'))
// const WalletPage = lazy(() => import('../pages/WalletPage'))
// const MarketplaceIntroPage = lazy(() => import('../pages/MarketplaceIntroPage'))

export default function Routes() {
  const chainId = useReactiveVar(chainIdVar)
  const theme = useReactiveVar(themeVar)
  const featureToggle = getFeatureToggleByChainId(chainId)
  const location = useLocation()

  useEffect(() => {
    const setTheme = (search: string) => {
      if (search.includes('theme=dark')) {
        themeVar(ThemeProviderEnum.dark)
      } else {
        themeVar(ThemeProviderEnum.light)
      }
    }

    setTheme(location.search)
  }, [location, theme])

  return (
    <Suspense fallback={<Header />}>
      <Switch>
        {/* {featureToggle?.page.marketplaceIntro && <Route path='/' exact component={MarketplaceIntroPage} />} */}
        {!featureToggle?.page.marketplaceIntro && <Route path='/' exact component={MainPage} />}
        <Route path='/' exact component={MainPage} />
        <Route path='/transparency' exact component={TransparencyPage} />
        <Route path='/fractionalize' exact component={FractionalizePage} />
        <Route path='/fractionalize/:address/:tokenId' exact component={FractionalizeDetailsPage} />
        <Route path='/portfolio' exact component={PortfolioPage} />
        <Route path='/bridge' exact component={BridgePage} />
        <Route path='/marketplace' exact component={MarketplacePage} />
        <Route path='/marketplace/:address' exact component={MarketplaceDetailsPage} />
        {featureToggle?.marketplace.collectiveBuy && (
          <Route path='/marketplace/:type/:address/:routeChainId?' exact component={MarketplaceDetailsPage} />
        )}
        <Route path='/marketplace/:address/:routeChainId?' exact component={MarketplaceDetailsPage} />
        <Route path='/wallet/box' exact component={BoxesPage} />
        <Route path='/wallet/box/:boxId' exact component={BoxDetailsPageV2} />
        <Route path='/wallet/fractionalize' exact component={FractionalizePage} />
        <Route path='/wallet/fractionalize/:address/:tokenId' exact component={FractionalizeDetailsPage} />

        <Route path='/wallet/portfolio' exact component={PortfolioPage} />
        <Route path='/create/box' exact component={MintBox} />
        <Route path='/create/image' exact component={MintPage} />
        <Route path='/create/video' exact component={MintPage} />
        <Route path='/create/audio' exact component={MintPage} />
        <Route path='/token/transparency' exact component={TransparencyPage} />
        <Route path='/token/bridge' exact component={BridgePage} />
        <Route path='/token/buy' exact component={BuyPage} />
        <Route path='/token/farm' exact component={FarmPage} />
        <Route path='/token/claim' exact component={ClaimPage} />
        <Route path='/disclaimer' exact component={DisclaimerPage} />
        <Route path='**' component={Page404} />
      </Switch>
    </Suspense>
  )
}
