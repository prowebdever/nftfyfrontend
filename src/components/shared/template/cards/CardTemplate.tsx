import { Skeleton, Spin } from 'antd'
import React, { ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import notFound from '../../../../assets/notfound.svg'
import { getChainConfigById } from '../../../../config'
import { imgLH3, safeIpfsUrl } from '../../../../services/UtilService'
import { colorsV2, fonts, viewportV2 } from '../../../../styles/variables'

export type CardTemplateProps = {
  image?: string
  animation_url?: string
  className?: string
  name?: string
  collectionAddress?: string
  ownership?: string
  isBoxNftCount?: number
  chainId: number
  url?: string
  loading?: boolean
  children?: ReactNode
}

export function CardTemplate({
  image,
  name,
  isBoxNftCount,
  collectionAddress,
  ownership,
  loading,
  className,
  chainId,
  url,
  children
}: CardTemplateProps) {
  const { boxAddress } = getChainConfigById(chainId)
  const metadataImage = image
  const [selectedImage, setSelectedImage] = useState((metadataImage && safeIpfsUrl(metadataImage)) || notFound)
  const onImageError = () => {
    setSelectedImage(notFound)
  }
  return (
    <S.Card>
      <Link to={`${url || '#'}`}>
        <S.Content>
          <Spin indicator={<Skeleton.Avatar active size={64} shape='circle' />} spinning={!!loading} />
          <S.Img
            src={imgLH3(selectedImage, 400)}
            className={selectedImage === notFound ? 'img-fail' : ''}
            onError={onImageError}
            alt={name || 'not found'}
            hidden={!!loading}
            loading='lazy'
          />
        </S.Content>
        <S.Tags>
          {boxAddress.toLowerCase() === collectionAddress?.toLowerCase() && <S.Tag>{`BOX (${isBoxNftCount})`}</S.Tag>}
          {ownership && <S.Tag>{`Ownership (${ownership}%)`}</S.Tag>}
        </S.Tags>
        <div className={className}>{children}</div>
      </Link>
    </S.Card>
  )
}

export const S = {
  Card: styled.div`
    width: 100%;
    height: auto;
    max-width: 400px;
    border: 1px solid ${colorsV2.gray[1]};
    box-sizing: border-box;
    border-radius: 16px;
    background: ${colorsV2.white};
    margin: 0 auto;

    &:hover {
      cursor: pointer;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow ease-in 250ms;
    }

    .ant-spin.ant-spin-spinning {
      width: 100%;
      height: auto;
      max-height: 400px;
      margin: auto;
    }
  `,
  Content: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border-top-right-radius: 16px;
    border-top-left-radius: 16px;
    min-height: 250px;

    @media (min-width: ${viewportV2.tablet}) {
      min-height: 250px;
    }

    @media (min-width: ${viewportV2.desktop}) {
      min-height: 300px;
    }
  `,
  Img: styled.img`
    width: 100%;
    height: auto;
    max-height: 400px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    -webkit-user-drag: none;
  `,
  Tag: styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 32px;
    background: ${colorsV2.white};
    padding: 10px;
    border-radius: 16px;
    box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.16);
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: ${colorsV2.black};
    font-family: ${fonts.nunito};
  `,

  Tags: styled.aside`
    position: absolute;
    margin-top: -48px;
    margin-left: 16px;
    width: auto;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    span {
      margin-right: 10px;
    }
  `,
  LoadArea: styled.div`
    width: 1000%;
  `
}
