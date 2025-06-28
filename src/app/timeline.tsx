'use client';
import React, { useMemo } from 'react';
import Timeline, { TimelineMarkers, TodayMarker, CursorMarker } from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/lib/Timeline.css';
import { Card, Typography } from 'antd';
const { Title } = Typography;

const groups = [
  { id: 1, title: '成就' },
  { id: 2, title: '习惯' },
  { id: 3, title: '里程碑' },
  { id: 4, title: '重要时刻' },
];

const now = moment();
const items = [
  {
    id: 1,
    group: 1,
    title: '获得奖学金',
    start_time: now.clone().subtract(10, 'days').valueOf(),
    end_time: now.clone().subtract(10, 'days').add(2, 'hours').valueOf(),
    color: '#52c41a',
  },
  {
    id: 2,
    group: 2,
    title: '坚持早起',
    start_time: now.clone().subtract(7, 'days').valueOf(),
    end_time: now.clone().subtract(7, 'days').add(1, 'hours').valueOf(),
    color: '#1890ff',
  },
  {
    id: 3,
    group: 3,
    title: '完成马拉松',
    start_time: now.clone().subtract(3, 'days').valueOf(),
    end_time: now.clone().subtract(3, 'days').add(3, 'hours').valueOf(),
    color: '#faad14',
  },
  {
    id: 4,
    group: 4,
    title: '生日聚会',
    start_time: now.clone().add(2, 'days').valueOf(),
    end_time: now.clone().add(2, 'days').add(4, 'hours').valueOf(),
    color: '#eb2f96',
  },
];

export default function TimelinePage() {
  const defaultTimeStart = useMemo(() => now.clone().subtract(12, 'hours').valueOf(), []);
  const defaultTimeEnd = useMemo(() => now.clone().add(12, 'hours').valueOf(), []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 32 }}>
      <Card style={{ maxWidth: 1200, margin: '0 auto', marginTop: 32 }}>
        <Title level={3}>时间轴</Title>
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={defaultTimeStart}
          defaultTimeEnd={defaultTimeEnd}
          canMove
          canResize="both"
          stackItems
          itemTouchSendsClick={false}
          lineHeight={60}
          itemHeightRatio={0.75}
          minZoom={60 * 60 * 1000}
          maxZoom={365.24 * 86400 * 1000}
          onItemSelect={id => {
            // TODO: 跳转到节点详情
            alert('点击节点ID: ' + id);
          }}
          itemRenderer={({ item, itemContext, getItemProps }) => (
            <div
              {...getItemProps({
                style: {
                  background: item.color,
                  color: '#fff',
                  borderRadius: 8,
                  padding: '0 12px',
                  fontWeight: 500,
                  boxShadow: itemContext.selected ? '0 0 0 2px #1677ff' : undefined,
                  cursor: 'pointer',
                },
              })}
            >
              {item.title}
            </div>
          )}
        >
          <TimelineMarkers>
            <TodayMarker />
            <CursorMarker>{() => null}</CursorMarker>
          </TimelineMarkers>
        </Timeline>
      </Card>
    </div>
  );
}
