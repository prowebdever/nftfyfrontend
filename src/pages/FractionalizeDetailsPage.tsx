import { useReactiveVar } from '@apollo/client'
import React from 'react'
import { useParams } from 'react-router-dom'
import { FractionalizeBoxItems } from '../components/fractionalize/FractionalizeBoxItems'
import { FractionalizeDetailsCardsLoading } from '../components/fractionalize/FractionalizeDetailsCardsLoading'
import { FractionalizeERC721 } from '../components/fractionalize/FractionalizeERC721'
import { SelectPaymentTokenModal } from '../components/shared/SelectPaymentTokenModal'
import { paymentTokenVar, selectPaymentTokenModalVar } from '../graphql/variables/FractionalizeVariables'
import { chainIdVar } from '../graphql/variables/WalletVariable'
import { useWalletNft } from '../hooks/WalletHooks'
import { AssetERC20 } from '../types/WalletTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function FractionalizeDetailsPage() {
  const { address, tokenId } = useParams<{ address: string; tokenId: string }>()
  const isVisible = useReactiveVar(selectPaymentTokenModalVar)
  const chainId = useReactiveVar(chainIdVar)

  const { erc721, isBox, nftsIntroBox } = useWalletNft(address, tokenId)

  if (!erc721) {
    return (
      <DefaultPageTemplate>
        <FractionalizeDetailsCardsLoading />
      </DefaultPageTemplate>
    )
  }

  return (
    <DefaultPageTemplate>
      <FractionalizeERC721 isBox={isBox} nftsIntroBox={nftsIntroBox} chainId={chainId} erc721={erc721} />
      {isBox && <FractionalizeBoxItems chainId={chainId} nfts={nftsIntroBox?.nfts || []} />}
      <SelectPaymentTokenModal
        location='fractionalize'
        visible={!!isVisible}
        onCancel={() => selectPaymentTokenModalVar(false)}
        onSelect={(erc20: AssetERC20) => {
          paymentTokenVar(erc20)
          selectPaymentTokenModalVar(false)
        }}
      />
    </DefaultPageTemplate>
  )
}
