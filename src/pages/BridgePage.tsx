import React from 'react'
import styled from 'styled-components'
import { BridgeForm } from '../components/bridge/BridgeForm'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function BridgePage() {
  return (
    <DefaultPageTemplate>
      <S.Container>
        <BridgeForm />
      </S.Container>
    </DefaultPageTemplate>
  )
}

export const S = {
  Container: styled.main`
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%), #f5f5f5;
    min-height: calc(100vh - 48px);
    display: flex;
    width: 100%;
    padding-top: 88px;
  `
}
