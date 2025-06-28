'use client';
import { Button, Card, Typography } from 'antd';
const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 32 }}>
      <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 64 }}>
        <Title level={2} style={{ textAlign: 'center' }}>个人成长记录型博客</Title>
        <Paragraph style={{ textAlign: 'center', color: '#888' }}>
          以横向时间轴为主视图，支持多媒体内容管理、节点搜索、权限控制等功能。
        </Paragraph>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <Button type="primary" size="large" onClick={() => window.location.href = '/timeline'}>开始记录</Button>
          <Button size="large" onClick={() => window.location.href = '/timeline'}>浏览时间轴</Button>
        </div>
      </Card>
    </div>
  );
}
