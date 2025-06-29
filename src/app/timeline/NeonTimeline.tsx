import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { Modal as AntdModal, Form, Input, DatePicker, Button, message } from 'antd';
import MediaPicker from '../../components/MediaPicker';
import MediaPreview from '../../components/MediaPreview';
import dayjs from 'dayjs';

const NEON_PINK = '#ff3ec8';
const NEON_PURPLE = '#ff5fff';
const NEON_BG = 'linear-gradient(10deg, #1a0033 0%,rgb(188, 151, 226) 100%)';

const TIMELINE_ANGLE = -15; // 斜向角度
const NODE_BASE_SIZE = 90; // 节点基准大小
const NODE_MIN_SCALE = 0.4; // 最小缩放
const NODE_MAX_SCALE = 1.5; // 最大缩放
const VIEWPORT_CENTER = 700; // 视口中心点(px)
const NODE_GAP = 300; // 节点间距（沿主线方向）
const VISIBLE_NODE_COUNT = 15; // 渲染视口附近的节点数

export default function NeonTimeline({ isAdmin = false }: { isAdmin?: boolean }) {
  const [offset, setOffset] = useState(0); // 沿主线方向的偏移
  const [dragging, setDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNode, setEditNode] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false); // 是否处于编辑节点模式
  const [items, setItems] = useState<any[]>([]); // 节点数据动态获取
  const [deleteNodeIdx, setDeleteNodeIdx] = useState<number | null>(null);
  const dragStart = useRef(0);
  const offsetStart = useRef(0);
  // 节点点击/双击互斥定时器
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // 拉取节点数据，返回节点数组
  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/nodes');
      if (!res.ok) throw new Error('获取节点失败');
      // 兼容后端返回数组或对象
      const data = await res.json();
      // 兼容 /api/node 返回数组 或 {nodes: Node[]} 两种格式
      const nodes = Array.isArray(data) ? data : (data.nodes || []);
      setItems(nodes);
      return nodes;
    } catch {
      message.error('节点数据加载失败');
      return [];
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  // 拖动主线（沿主线方向）
  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragStart.current = e.pageX;
    offsetStart.current = offset;
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };
  const onDragMove = (e: MouseEvent) => {
    // 拖动距离投影到主线方向
    const dx = e.pageX - dragStart.current;
    const dy = 0; // 只考虑横向拖动
    const rad = (TIMELINE_ANGLE * Math.PI) / 180;
    // 计算鼠标拖动在主线方向上的分量
    const delta = dx * Math.cos(rad) + dy * Math.sin(rad);
    setOffset(offsetStart.current + -delta);
  };
  const onDragEnd = () => {
    setDragging(false);
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  // 斜向主线的起点
  const lineStart = { x: 0, y: 550 };
  // 无限主线，不设终点
  const lineLength = 99999;
  const lineEnd = {
    x: lineStart.x + lineLength * Math.cos((TIMELINE_ANGLE * Math.PI) / 180),
    y: lineStart.y + lineLength * Math.sin((TIMELINE_ANGLE * Math.PI) / 180),
  };

  // 渲染视口附近的节点（理论无限）
  const centerIdx = Math.round(offset / NODE_GAP);
  const nodeIndices = Array.from({ length: VISIBLE_NODE_COUNT }, (_, i) => i + centerIdx - Math.floor(VISIBLE_NODE_COUNT / 2));

  // 点击节点时自动居中并显示详情或编辑
  const handleNodeClick = (nodeIdx: number) => {
    setShowEditModal(false);
    setDeleteNodeIdx(null);
    setTimeout(() => {
      const targetOffset = nodeIdx * NODE_GAP - (VIEWPORT_CENTER - lineStart.x) / Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
      setOffset(targetOffset);
      if (isAdmin && editMode) {
        // 进入编辑表单，填充当前节点信息
        const item = items[((nodeIdx % items.length) + items.length) % items.length];
        setEditNode({ ...item });
        setShowEditModal(true);
        setTimeout(() => {
          form.setFieldsValue({
            title: item.title,
            content: item.content,
            date: item.date ? dayjs(item.date) : dayjs(),
            tag: item.tag
          });
        }, 0);
      } else {
        setSelectedNode(nodeIdx);
      }
    }, 0);
  };

  // 双击节点触发删除
  // const handleNodeDoubleClick = (nodeIdx: number) => {
  //   if (!isAdmin) return;
  //   setShowEditModal(false);
  //   setDeleteNodeIdx(null);
  //   // 居中主线
  //   const targetOffset = nodeIdx * NODE_GAP - (VIEWPORT_CENTER - lineStart.x) / Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
  //   setOffset(targetOffset);
  //   setTimeout(() => setDeleteNodeIdx(nodeIdx), 50); // 延迟 50ms，确保 useEffect 能捕获变化
  // };

  // 新增节点按钮点击
  const handleAddNode = () => {
    setEditNode({
      title: '',
      content: '',
      date: dayjs().format('YYYY-MM-DD'),
      tag: '',
      media: []
    });
    setShowEditModal(true);
    setEditMode(false); // 新增时关闭编辑模式
    setTimeout(() => {
      form.setFieldsValue({
        title: '',
        content: '',
        date: dayjs(),
        tag: ''
      });
    }, 0);
  };
  // 编辑节点按钮点击
  const handleEditMode = () => {
    setEditMode(true);
    message.info('请点击要编辑的节点');
  };
  // 保存节点（新增/编辑）
  const handleSaveNode = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let newNodeId: string | number | undefined = undefined;
      // 构造后端所需字段，统一用 date 字段
      const payload = {
        title: values.title,
        content: values.content,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        tag: values.tag,
        media: form.getFieldValue('media') || []
      };
      if (editNode && (editNode.id || editNode._id)) {
        // 编辑已有节点
        const res = await fetch(`/api/nodes?id=${editNode.id || editNode._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('保存失败');
        message.success('节点已更新');
      } else {
        // 新增节点
        const res = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('保存失败');
        const data = await res.json();
        newNodeId = data._id || data.id || data.node?._id || data.node?.id;
        message.success('节点已保存');
      }
      setShowEditModal(false);
      setEditNode(null);
      setEditMode(false);
      // fetchNodes 返回最新节点数组
      const latestNodes = await fetchNodes();
      // 新增节点后自动居中显示
      if (newNodeId && latestNodes.length > 0) {
        const idx = latestNodes.findIndex((n: { _id?: string; id?: string }) => n._id === newNodeId || n.id === newNodeId);
        if (idx >= 0) {
          const targetOffset = idx * NODE_GAP - (VIEWPORT_CENTER - lineStart.x) / Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
          setOffset(targetOffset);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };
  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditNode(null);
    setEditMode(false);
  };

  // 删除确认状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setLoading(true);
    try {
      await fetch(`/api/nodes?id=${deleteItem._id || deleteItem.id}`, { method: 'DELETE' });
      message.success('节点已删除');
      await fetchNodes();
    } catch (err) {
      console.error('删除节点失败:', err);
      message.error('删除失败');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setEditMode(false);
    }
  };

  // 双击节点触发删除确认
  const handleNodeDoubleClick = (nodeIdx: number) => {
    if (!isAdmin) return;
    setShowEditModal(false);
    setDeleteNodeIdx(null);
    // 居中主线
    const targetOffset = nodeIdx * NODE_GAP - (VIEWPORT_CENTER - lineStart.x) / Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
    setOffset(targetOffset);
    // 设置要删除的节点
    const item = items[((nodeIdx % items.length) + items.length) % items.length];
    setDeleteItem(item);
    setShowDeleteConfirm(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: NEON_BG, position: 'relative', overflow: 'hidden' }}>
      {/* 删除确认Modal */}
      {showDeleteConfirm && deleteItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(30,20,60,0.98)',
            border: '2px solid #ff3ec8',
            borderRadius: 18,
            boxShadow: '0 0 32px #ff3ec8',
            color: '#fff',
            padding: 32,
            width: 400,
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: 16 }}>确认删除该节点？</h3>
            <p style={{ marginBottom: 24 }}>{deleteItem.title}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteItem(null);
                }}
                style={{ background: '#7f5fff', border: 'none' }}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                danger 
                loading={loading}
                onClick={handleDeleteConfirm}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 新增/编辑节点Modal */}
      <AntdModal
        title={editNode && (editNode.id || editNode._id) ? '编辑节点' : '新增节点'}
        open={showEditModal}
        onCancel={handleCancelEdit}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: editNode?.title,
            content: editNode?.content,
            date: editNode?.date ? dayjs(editNode.date) : dayjs(),
            tag: editNode?.tag,
            media: editNode?.media || []
          }}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}> 
          <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}> 
          <Input.TextArea rows={3} maxLength={200} />
          </Form.Item>
          <Form.Item name="date" label="时间" rules={[{ required: true, message: '请选择时间' }]}> 
          <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tag" label="标签" rules={[{ required: true, message: '请输入标签' }]}> 
          <Input maxLength={16} />
          </Form.Item>
          <Form.Item label="多媒体内容">
            <MediaPicker 
              onSelect={(media) => {
                const currentMedia = form.getFieldValue('media') || [];
                const newMedia = [...currentMedia, ...media];
                form.setFieldsValue({ media: newMedia });
                // 即时更新editNode的media状态
                setEditNode(prev => ({ ...prev, media: newMedia }));
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {(form.getFieldValue('media') || []).map((item: any, index: number) => (
                <MediaPreview
                  key={index}
                  media={item}
                  onRemove={() => {
                    const media = form.getFieldValue('media') || [];
                    form.setFieldsValue({
                      media: media.filter((_: any, i: number) => i !== index)
                    });
                  }}
                />
              ))}
            </div>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={handleCancelEdit}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleSaveNode}>保存</Button>
          </div>
        </Form>
      </AntdModal>
      <div
        style={{ width: '100vw', height: 700, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onDragStart}
      >
        <svg width="100vw" height="700" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
          {/* 无限主线 */}
          <defs>
            <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={NEON_PINK} />
              <stop offset="100%" stopColor={NEON_PURPLE} />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={NEON_PINK} floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="24" floodColor={NEON_PURPLE} floodOpacity="0.7" />
            </filter>
          </defs>
          <line
            x1={lineStart.x}
            y1={lineStart.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
            stroke="url(#neonLine)"
            strokeWidth="10"
            filter="url(#neonGlow)"
            strokeLinecap="round"
          />
        </svg>
        {/* 无限节点 */}
        {items.length > 0 && nodeIndices.map((nodeIdx) => {
          // 节点内容循环取自 items
          const item = items[((nodeIdx % items.length) + items.length) % items.length];
          if (!item) return null;
          // 节点在主线上的距离
          const pos = nodeIdx * NODE_GAP - offset;
          // 计算三角中心点坐标
          const x = lineStart.x + pos * Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
          const y = lineStart.y + pos * Math.sin((TIMELINE_ANGLE * Math.PI) / 180);
          // 计算缩放：距离视口中心越近越大
          const dist = Math.abs(x - VIEWPORT_CENTER);
          const scale = Math.max(NODE_MIN_SCALE, NODE_MAX_SCALE - dist / 300);
          const opacity = Math.max(0.2, 1 - dist / 900);
          // 三角颜色
          const TRIANGLE_COLOR = 'rgb(246,209,251)';
          // 圆圈颜色
          const CIRCLE_COLOR = 'rgb(245, 192, 212)';
          return (
            <div
              key={nodeIdx}
              style={{
                position: 'absolute',
                left: x - NODE_BASE_SIZE / 2 * scale,
                top: y - NODE_BASE_SIZE / 2 * scale*1.2,
                width: NODE_BASE_SIZE * scale,
                height: NODE_BASE_SIZE * scale,
                zIndex: 2,
                opacity,
                transition: dragging ? 'none' : 'all 0.3s cubic-bezier(.4,2,.6,1)',
                pointerEvents: 'auto',
              }}
              title={item.title}
              onClick={e => {
                e.stopPropagation();
                if (clickTimer.current) clearTimeout(clickTimer.current);
                clickTimer.current = setTimeout(() => {
                  handleNodeClick(nodeIdx);
                  clickTimer.current = null;
                }, 200); // 200ms 内未双击则视为单击
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                e.preventDefault();
                if (clickTimer.current) {
                  clearTimeout(clickTimer.current);
                  clickTimer.current = null;
                }
                console.log('Double clicked node:', nodeIdx, item);
                handleNodeDoubleClick(nodeIdx);
              }}
            >
              {/* 时间日期（上方） */}
              <div style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: 'translateX(-50%) rotate(3deg)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16 * scale,
                textShadow: `0 0 8px ${TRIANGLE_COLOR}`,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>{item.date ? dayjs(item.date).format('YYYY-MM-DD') : ''}</div>
              <svg width="100%" height="100%" viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 0 24px rgb(246,209,251))' }}>
                <polygon
                  points="30,8 56,52 6,48"
                  fill="rgba(246,209,251,0.12)"
                  stroke={TRIANGLE_COLOR}
                  strokeWidth="5"
                  style={{ transition: 'filter 0.2s, transform 0.2s' }}
                />
                <circle cx="30" cy="36" r="7" fill={CIRCLE_COLOR} opacity="0.5" />
              </svg>
              {/* 标题（下方） */}
              <div style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%) rotate(5deg)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16 * scale,
                textShadow: `0 0 8px ${TRIANGLE_COLOR}`,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>{item.title}</div>
            </div>
          );
        })}
        {/* 详情展示区域 */}
        {selectedNode !== null && (() => {
          const idx = selectedNode;
          const item = items[((idx % items.length) + items.length) % items.length];
          return (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 120,
              transform: 'translateX(-50%)',
              minWidth: 420,
              maxWidth: 600,
              background: 'rgba(30,20,60,0.98)',
              border: '2px solid #ff3ec8',
              borderRadius: 18,
              boxShadow: '0 0 32px #ff3ec8',
              color: '#fff',
              zIndex: 99,
              padding: 32,
              textAlign: 'center',
              fontSize: 18,
            }}>
              <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: '#ffb3fa', fontWeight: 500, marginBottom: 8 }}>
                {item.date ? dayjs(item.date).format('YYYY-MM-DD') : ''}
                {item.tag && (
                  <span style={{ marginLeft: 12, color: '#7f5fff', background: 'rgba(127,95,255,0.12)', borderRadius: 6, padding: '2px 10px', fontSize: 14, fontWeight: 600 }}>
                    {item.tag}
                  </span>
                )}
              </div>
              <div style={{ marginBottom: 16 }}>{typeof item.content === 'number' ? item.content : (item.content || '-')}</div>
              {/* 多媒体内容展示 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                {item.media && item.media.map((media: { type: string; url: string }, idx: number) => {
                  if (media.type === 'image') return <Image key={idx} src={media.url} alt="img" width={320} height={200} style={{ maxWidth: 320, borderRadius: 8, boxShadow: '0 0 12px #ff3ec8', height: 'auto' }} />;
                  if (media.type === 'audio') return <audio key={idx} src={media.url} controls style={{ width: 320 }} />;
                  if (media.type === 'video') return <video key={idx} src={media.url} controls style={{ width: 320, borderRadius: 8, boxShadow: '0 0 12px #ff3ec8' }} />;
                  return null;
                })}
              </div>
              <button style={{ marginTop: 12, background: '#ff3ec8', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 8px #ff3ec8' }} onClick={() => setSelectedNode(null)}>关闭</button>
            </div>
          );
        })()}
        {/* 管理员模式下操作按钮 */}
        {isAdmin && (
          <div style={{ position: 'absolute', left: 40, bottom: 40, zIndex: 10, display: 'flex', gap: 16 }}>
            <button style={{ background: '#ff3ec8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #ff3ec8' }} onClick={handleAddNode}>新增节点</button>
            <button style={{ background: '#7f5fff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #7f5fff' }} onClick={handleEditMode}>编辑节点</button>
            <button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #888' }} onClick={() => {
              window.localStorage.removeItem('isAdmin');
              window.location.reload();
            }}>退出管理员模式</button>
          </div>
        )}
      </div>
    </div>
  );
}
