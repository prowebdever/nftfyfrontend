import { Skeleton } from 'antd'
import React from 'react'
import styled from 'styled-components'

export const BoxModalLoading = () => {
  return (
    <>
      <S.Container>
        <Skeleton.Avatar active size={56} shape='square' />
        <Skeleton active paragraph={{ rows: 0 }} />
      </S.Container>
    </>
  )
}

const S = {
  Container: styled.div`
    width: 100%;
    display: flex;
    margin-bottom: 24px;
    align-items: center;
    gap: 8px;

    h3.ant-skeleton-title {
      width: 98% !important;
    }

    span.ant-skeleton-avatar.ant-skeleton-avatar-square {
      border-radius: 8px;
    }
  `
}
