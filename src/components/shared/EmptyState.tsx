import { Empty } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { viewportMargin, viewportV2 } from '../../styles/variables'

export default function EmptyState() {
  return (
    <S.Container>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin: ${viewportMargin.base};

    @media (min-width: ${viewportV2.tablet}) {
      margin-bottom: ${viewportMargin.tablet};
    }

    @media (min-width: ${viewportV2.desktop}) {
      margin-bottom: ${viewportMargin.desktop};
    }
  `
}
