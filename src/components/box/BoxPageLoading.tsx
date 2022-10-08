import { Skeleton } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { colorsV2, viewport } from '../../styles/variables'

export const BoxPageLoading = () => {
  return (
    <>
      <S.ListBox>
        <Skeleton.Avatar active size='large' shape='square' />
        <S.CardLoading>
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
        </S.CardLoading>
        <S.CardLoadingTwo>
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
        </S.CardLoadingTwo>
      </S.ListBox>
      <S.ListBox>
        <Skeleton.Avatar active size='large' shape='square' />
        <S.CardLoading>
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
        </S.CardLoading>
        <S.CardLoadingTwo>
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
        </S.CardLoadingTwo>
      </S.ListBox>
      <S.ListBox>
        <Skeleton.Avatar active size='large' shape='square' />
        <S.CardLoading>
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
          <Skeleton active paragraph={{ rows: 0 }} />
        </S.CardLoading>
        <S.CardLoadingTwo>
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
          <Skeleton.Avatar active size='large' shape='square' />
        </S.CardLoadingTwo>
      </S.ListBox>
    </>
  )
}

const S = {
  ListBox: styled.li`
    width: 100%;
    height: auto;
    min-height: 136px;
    border: 1px solid ${colorsV2.gray[1]};
    box-sizing: border-box;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    .ant-skeleton-paragraph {
      li {
        height: 16px !important;
      }
    }
    .ant-skeleton-avatar {
      width: 104px;
      height: 104px;
      margin-right: 15px;
    }
    @media (max-width: ${viewport.lg}) {
      flex-direction: column;
    }
  `,
  CardLoading: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1;
    height: 106px;
    margin-left: 15px;
    .ant-skeleton {
      .ant-skeleton-content {
        h3 {
          margin-top: 0px;
          margin-bottom: 10px;
          width: 90% !important;
        }
        .ant-skeleton-paragraph {
          display: none;
        }
      }
    }
    @media (max-width: ${viewport.lg}) {
      width: 100%;
      margin: 0px;
      margin-top: 20px;
      .ant-skeleton-title {
        width: 100% !important;
      }
    }
  `,
  CardLoadingTwo: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex: 1;
    height: 106px;
    margin-left: 15px;
    .ant-skeleton {
      margin-right: 10px;
    }
    @media (max-width: ${viewport.lg}) {
      margin-left: 0px;
    }
  `
}
