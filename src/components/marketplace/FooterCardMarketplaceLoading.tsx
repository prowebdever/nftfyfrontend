import React from 'react'
import { Skeleton } from 'antd'
import styled from 'styled-components'

interface FooterCardMarketplaceLoadingProps {
  loading?: boolean
}

export const FooterCardMarketplaceLoading = ({ loading }: FooterCardMarketplaceLoadingProps) => {
  return (
    <S.Content>
      <div>
        <Skeleton className='full-width-skeleton' loading={loading} active paragraph={{ rows: 0 }} />
      </div>
      <div>
        <Skeleton className='full-width-skeleton' loading={loading} active paragraph={{ rows: 0 }} />
      </div>
      <div>
        <Skeleton className='full-width-skeleton' loading={loading} active paragraph={{ rows: 0 }} />
      </div>
    </S.Content>
  )
}

const S = {
  Content: styled.div`
    padding: 16px 24px 24px 24px;
    div {
      .ant-skeleton-content {
        .ant-skeleton-title {
          width: 100% !important;
        }
        ul {
          display: none;
        }
      }
    }
  `
}
