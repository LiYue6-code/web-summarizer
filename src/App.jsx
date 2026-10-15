import { useState, useRef, useEffect } from 'react';
import { Typography, Input, Button, Spin, Card, Alert, Tag, Collapse } from 'antd';
import { FileTextOutlined, GlobalOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const NAV_ITEMS = [
  { label: '功能', href: '#tool' },
  { label: '特点', href: '#features' },
  { label: '常见问题', href: '#faq' }
];

const STAGES = ['正在抓取网页…', '正在提取正文…', 'AI 正在总结…'];

const FAQ_ITEMS = [
  {
    key: '1',
    label: '支持哪些网页？',
    children: (
      <p>博客、新闻、公众号等文章型网页效果最好；需要登录或纯 JS 动态渲染的页面可能提取不到正文。</p>
    )
  },
  {
    key: '2',
    label: '摘要为什么是中文？',
    children: <p>无论原文是中文还是英文，AI 都会统一翻译并总结为中文摘要。</p>
  },
  {
    key: '3',
    label: '需要付费吗？',
    children: <p>工具本身免费开源，但调用 DeepSeek AI 需要你自己的 API Key，按用量计费（费用很低）。</p>
  }
];

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleSummarize = async () => {
    const target = url.trim();
    if (!target) {
      setError('请先输入网址');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    setStage(0);
    timerRef.current = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 1800);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '处理失败');
      setResult(data);
    } catch (err) {
      setError(err.message || '出错了，请稍后重试');
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="site">
      <header className="navbar">
        <div className="navbar-inner">
          <a className="brand" href="#">
            <img src="/logo.svg" alt="网页总结工具 Logo" className="brand-logo" />
            <span className="brand-name">网页总结</span>
          </a>
          <nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="content">
        <section className="hero" id="tool">
          <Tag className="hero-badge" bordered={false}>
            ✨ 由 AI 驱动
          </Tag>
          <h1 className="hero-title">一句话总结任何网页</h1>
          <p className="hero-sub">输入网址，AI 自动提取正文，并用中文生成简洁摘要</p>
        </section>

        <section className="summarizer-wrap">
          <Card className="summarizer-card" bordered={false}>
            <div className="input-row">
              <Input
                className="url-input"
                size="large"
                placeholder="粘贴网页链接，例如 https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPressEnter={handleSummarize}
                allowClear
              />
              <Button
                className="cta-btn"
                type="primary"
                size="large"
                disabled={loading}
                onClick={handleSummarize}
              >
                {loading ? '总结中…' : '开始总结'}
              </Button>
            </div>

            {loading && (
              <div className="loading-box">
                <Spin size="large" />
                <Text type="secondary">{STAGES[stage]}</Text>
              </div>
            )}

            {error && !loading && (
              <Alert className="alert-box" type="error" message={error} showIcon />
            )}

            {result && !loading && (
              <Card className="result-card" bordered={false}>
                <Title level={4}>{result.title}</Title>
                <Paragraph className="result-summary">{result.summary}</Paragraph>
                {result.charCount ? (
                  <Text type="secondary" className="result-meta">
                    已提取正文 {result.charCount.toLocaleString()} 字
                  </Text>
                ) : null}
              </Card>
            )}
          </Card>
        </section>

        <section className="features" id="features">
          <h2 className="section-title">为什么选择我们</h2>
          <div className="features-grid">
            <FeatureCard
              icon={<FileTextOutlined />}
              title="智能提取正文"
              desc="自动过滤广告、导航等噪音，只保留核心内容"
            />
            <FeatureCard
              icon={<GlobalOutlined />}
              title="中英文都支持"
              desc="英文网页自动翻译，统一用中文输出摘要"
            />
            <FeatureCard
              icon={<ThunderboltOutlined />}
              title="快速高效"
              desc="基于 DeepSeek 大模型，数秒内生成精准摘要"
            />
          </div>
        </section>

        <section className="faq" id="faq">
          <h2 className="section-title">常见问题</h2>
          <div className="faq-inner">
            <Collapse ghost items={FAQ_ITEMS} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© 2026 网页总结工具 · 让阅读更高效</span>
          <span>Powered by DeepSeek</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="feature-card" bordered={false} hoverable>
      <div className="feature-icon">{icon}</div>
      <Title level={4}>{title}</Title>
      <Paragraph type="secondary" className="feature-desc">
        {desc}
      </Paragraph>
    </Card>
  );
}

export default App;
