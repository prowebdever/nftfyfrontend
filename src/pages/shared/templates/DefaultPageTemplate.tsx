import React, { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { AlertWalletMessage } from '../../../components/fractionalize/AlertWalletMessage'
import { BscAlertMessage } from '../../../components/shared/BscAlertMessage'
import { Footer } from '../../../components/shared/layout/footer/Footer'
import { Header } from '../../../components/shared/layout/header/Header'
export type DefaultTemplatePageProps = {
  alertWallet?: boolean
  alertBscNetwork?: boolean
  children: ReactNode
  bgGray?: boolean
  noMargin?: boolean
  fullWidth?: boolean
}

export function DefaultPageTemplate({ alertWallet, alertBscNetwork, children, bgGray, noMargin, fullWidth }: DefaultTemplatePageProps) {
  return (
    <>
      <Header />
      {alertWallet && <AlertWalletMessage />}
      {alertBscNetwork && <BscAlertMessage />}
      <S.Main bgGray={!!bgGray} noMargin={!!noMargin}>
        <S.Container fullWidth={!!fullWidth}>{children}</S.Container>
      </S.Main>
      <Footer />
    </>
  )
}
export const S = {
  Main: styled.main<{ bgGray?: boolean; noMargin: boolean }>`
    width: 100%;
    min-height: calc(100vh - 48px);
    background: ${props => props.theme.white};
    display: block;
    align-items: center;
    margin-top: 96px;

    ${props =>
      props.bgGray &&
      css`
        background: ${props.theme.gray[0]};
      `}

    ${props =>
      css`
        padding: ${props.noMargin ? 0 : props.theme.margin.small};
      `}

    @media (min-width: ${props => props.theme.viewport.tablet}) {
      padding: ${props => props.theme.margin.medium};
      ${props =>
        css`
          padding: ${props.noMargin ? 0 : props.theme.margin.medium}};
        `}
    }

    @media (min-width: ${props => props.theme.viewport.desktop}) {
      padding: ${props => props.theme.margin.large};
      ${props =>
        css`
          padding: ${props.noMargin ? 0 : props.theme.margin.large};
        `}
    }

    .infinite-scroll-component {
      vertical-align: top !important;
    }
  `,
  Container: styled.div<{ fullWidth?: boolean }>`
    width: 100%;
    margin: 0 auto;

    ${props =>
      !props.fullWidth &&
      css`
        max-width: ${props.theme.viewport.desktopXl};
      `}
  `
}
