# 实训项目详解

> 10 个 Pandas 数据分析实战项目，从入门到高级，覆盖数据清洗到机器学习的完整技能体系

---

## 目录

- [项目 1: 电商订单脏数据清洗与标准化](#项目1)
- [项目 2: 用户行为日志的透视重塑](#项目2)
- [项目 3: Apriori 购物车关联分析](#项目3)
- [项目 4: 销售数据的 RFM 客户价值分层](#项目4)
- [项目 5: K-Means 聚类用户分群](#项目5)
- [项目 6: 时间序列异常值检测](#项目6)
- [项目 7: 多源数据融合归因分析](#项目7)
- [项目 8: 文本评论情感极性清洗与分词](#项目8)
- [项目 9: 帕累托分析商品贡献度](#项目9)
- [项目 10: 端到端实战 — 购物篮聚类与推荐报告](#项目10)

---

<a name="项目1"></a>
## 项目 1: 电商订单脏数据清洗与标准化

**难度**: 🟢 入门 | **分类**: 数据清洗

### 项目背景

原始 CSV 文件来自多个海外仓系统，存在以下问题：
- 字段编码不一致（UTF-8 vs GBK）
- 金额格式混乱（`$1,200.00`、`€850.5` 等）
- 客户 ID 存在缺失值
- 日期格式各异（`YYYY-MM-DD`、`MM/DD/YYYY` 等）

### 学习目标

| 技能点 | 对应 Pandas 方法 | 学习深度 |
|--------|-----------------|---------|
| 读取 CSV 文件 | `pd.read_csv()` | 基础 |
| 正则表达式清洗 | `str.replace()` + `re` 模块 | 入门 |
| 缺失值逻辑填充 | `iterrows()` + 条件判断 | 基础 |
| 日期类型转换 | `pd.to_datetime()` | 基础 |
| Lambda 函数应用 | `apply(lambda x: ...)` | 进阶 |

### 核心任务分解

#### 任务 1: 统一金额格式

**问题**: 不同货币符号和千分位导致无法进行数值运算

```python
# 原始数据          →  目标数据
# "$1,200.00"       →  1200.00
# "€850.5"          →  850.5
# "$3,450.75"       →  3450.75

def clean_amount(val):
    if pd.isna(val):
        return None
    # 移除所有非数字和非小数点的字符
    val = re.sub(r'[^\d.]', '', str(val))
    return float(val) if val else None

df['amount'] = df['amount'].apply(clean_amount)
```

**关键知识点**:
- `pd.isna()`: 判断是否为空值（None、NaN、NaT 都返回 True）
- `re.sub(pattern, repl, string)`: 正则替换
- `[^\d.]`: 匹配所有非数字和非小数点的字符
- `apply()`: 将函数应用到 Series 的每个元素

#### 任务 2: 填充缺失的 customer_id

**业务规则**: 
- 如果订单金额 > 0 但 ID 缺失 → 标记为 `Guest_随机数`
- 如果金额也为空 → 标记为 `Unknown`

```python
for idx, row in df.iterrows():
    if pd.isna(row['customer_id']):
        if row['amount'] and row['amount'] > 0:
            df.at[idx, 'customer_id'] = f'Guest_{random.randint(1000, 9999)}'
        else:
            df.at[idx, 'customer_id'] = 'Unknown'
```

**关键知识点**:
- `iterrows()`: 逐行遍历 DataFrame
- `df.at[idx, col]`: 按索引和列名定位单个单元格
- 业务逻辑与数据处理的结合

#### 任务 3: 日期转换与未来日期过滤

```python
# format=None 让 Pandas 自动推断格式
# errors='coerce' 将无法解析的日期转为 NaT
df['order_date'] = pd.to_datetime(df['order_date'], format=None, errors='coerce')

# 剔除未来日期
today = datetime.now()
df = df[df['order_date'] <= today]
```

**关键知识点**:
- `format=None`: 自动推断日期格式（兼容 `YYYY-MM-DD`、`MM/DD/YYYY`）
- `errors='coerce'`: 错误处理策略
  - `'raise'`: 抛出异常（默认）
  - `'coerce'`: 无法解析的设为 NaT
  - `'ignore'`: 返回原始输入

### 数据清洗流程图

```
原始脏数据
    ↓
[读取] pd.read_csv()
    ↓
[清洗金额] 正则移除 $ € , → float
    ↓
[填充ID]  缺失值按业务逻辑填充
    ↓
[转换日期] to_datetime + 过滤未来日期
    ↓
[NaN处理]  删除或填充剩余空值
    ↓
干净数据 → 可用于分析/建模
```

### 常见错误与解决

| 错误 | 原因 | 解决 |
|------|------|------|
| `ValueError: could not convert string to float` | 金额含货币符号 | 先用正则清洗再转换 |
| `TypeError: '<' not supported` | 日期仍为字符串 | 确保 `pd.to_datetime()` 执行成功 |
| 未来日期未过滤 | 比较对象类型不一致 | 确保两边都是 datetime 类型 |

---

<a name="项目2"></a>
## 项目 2: 用户行为日志的透视重塑

**难度**: 🟢 入门 | **分类**: 数据重塑

### 项目背景

用户点击流数据是典型的"长格式"（Long Format）数据：

```
user_id  action    timestamp
1001     click     2024-01-01 10:00
1001     cart      2024-01-01 10:05
1001     buy       2024-01-01 10:15
1002     click     2024-01-02 14:00
1002     buy       2024-01-02 14:30
```

无法直接做用户画像分析，需要转换为"宽格式"（Wide Format）：

```
user_id  click_count  cart_count  buy_count
1001     1            1           1
1002     1            0           1
```

### 长格式 vs 宽格式

```
长格式 (Long Format):                    宽格式 (Wide Format):
┌────────┬────────┬───────┐              ┌────────┬──────────┬──────────┬─────────┐
│ user   │ action │ count │              │ user   │ click    │ cart     │ buy     │
├────────┼────────┼───────┤              ├────────┼──────────┼──────────┼─────────┤
│ 1001   │ click  │   5   │              │ 1001   │    5     │    3     │   2     │
│ 1001   │ cart   │   3   │       →      │ 1002   │    2     │    0     │   1     │
│ 1001   │ buy    │   2   │              │ 1003   │    8     │    4     │   3     │
│ 1002   │ click  │   2   │              └────────┴──────────┴──────────┴─────────┘
│ 1002   │ buy    │   1   │
└────────┴────────┴───────┘
```

### 核心任务分解

#### 任务 1: pivot_table 透视

```python
pivot = df.pivot_table(
    index='user_id',        # 行: 每个用户一行
    columns='action',       # 列: 每种行为类型一列
    values='timestamp',     # 值: 计数
    aggfunc='count',        # 聚合方式: 计数
    fill_value=0            # 缺失值填充为0
)
pivot.columns = [f'{col}_count' for col in pivot.columns]
```

**参数详解**:

| 参数 | 作用 | 类比 |
|------|------|------|
| `index` | 结果 DataFrame 的行索引 | Excel 透视表的"行" |
| `columns` | 结果 DataFrame 的列名 | Excel 透视表的"列" |
| `values` | 要聚合的值 | Excel 透视表的"值" |
| `aggfunc` | 聚合函数 | count/sum/mean 等 |
| `fill_value` | 替换 NaN 的值 | 默认 NaN，常设为 0 |

#### 任务 2: 行为时间间隔计算

```python
# 按用户排序后计算相邻行为的时间差
df = df.sort_values(['user_id', 'timestamp'])
df['time_diff'] = df.groupby('user_id')['timestamp'].diff()
```

**关键知识点**:
- `groupby()`: 按某列分组
- `diff()`: 计算相邻行的差值（对于 datetime 类型返回 Timedelta）

#### 任务 3: 会话窗口切割

**业务规则**: 30 分钟内无操作视为同一会话，超过 30 分钟视为新会话。

```python
# 判断是否开启新会话
df['new_session'] = df.groupby('user_id')['timestamp'].transform(
    lambda x: x.diff() > pd.Timedelta('30min')
)

# 累计求和得到会话ID
df['session_id'] = df.groupby('user_id')['new_session'].cumsum()
```

**关键知识点**:
- `transform()`: 与 groupby 配合，返回与原 DataFrame 相同长度的结果
- `cumsum()`: 累计求和（True=1, False=0）

```
时间线示意:
10:00 → 10:05 → 10:15      14:00 → 14:30
  │       │       │          │       │
  └── 会话1 ──┘           └─ 会话2 ─┘
         (间隔15min)             (间隔30min)
         
10:15 ─────── 14:00
       (间隔近4小时 → 新会话)
```

---

<a name="项目3"></a>
## 项目 3: Apriori 购物车关联分析

**难度**: 🔵 基础 | **分类**: 关联分析

### 项目背景

经典的"啤酒与尿布"故事：沃尔玛发现购买尿布的顾客经常同时购买啤酒。这是**关联规则学习**（Association Rule Learning）的经典应用。

### 核心概念

| 概念 | 定义 | 公式 | 业务解读 |
|------|------|------|---------|
| **事务** | 一次购买的所有商品 | — | 一个订单就是一个事务 |
| **支持度** | 同时购买 A 和 B 的概率 | P(A∩B) | "有多少订单同时包含这两件商品？" |
| **置信度** | 买了 A 的人买 B 的概率 | P(B\|A) | "买 A 的顾客中，有多少也买了 B？" |
| **提升度** | 关联的强度 | P(B\|A) / P(B) | "A 和 B 是正相关还是独立？" |

### 核心任务分解

#### 任务 1: 构建购物篮清单

```python
# 原始数据                 →  购物篮清单
# order_id  product        →  order_id  items
# 1         尿布           →  1         [尿布, 啤酒, 薯片]
# 1         啤酒           →  2         [牛奶, 面包]
# 1         薯片           →  3         [尿布, 啤酒, 纸巾]
# 2         牛奶
# 2         面包

basket = df.groupby('order_id')['product'].apply(list).reset_index()
```

#### 任务 2: 构建 One-Hot 布尔矩阵

```python
# 购物篮                    →  One-Hot 矩阵
# order_id  items           →  尿布  啤酒  薯片  牛奶  面包
# 1        [尿布,啤酒,薯片]   →   1     1     1     0     0
# 2        [牛奶,面包]       →   0     0     0     1     1
# 3        [尿布,啤酒,纸巾]   →   1     1     0     0     0

all_products = df['product'].unique()
one_hot = {}
for _, row in basket.iterrows():
    for prod in all_products:
        one_hot.setdefault(prod, []).append(prod in row['items'])

matrix = pd.DataFrame(one_hot)
```

#### 任务 3: 计算关联规则

```python
total_orders = len(basket)

# 支持度: 单个商品出现的概率
support = {}
for prod in all_products:
    support[prod] = matrix[prod].mean()

# 置信度: 买了A的人买B的概率
confidence = {}
for p1 in all_products:
    for p2 in all_products:
        if p1 != p2:
            both = ((matrix[p1] == True) & (matrix[p2] == True)).sum()
            a_only = (matrix[p1] == True).sum()
            if a_only > 0:
                confidence[f'{p1}→{p2}'] = both / a_only
```

### 关联规则示例

```
假设 1000 个订单:
  买尿布: 200 单
  买啤酒: 300 单
  同时买: 100 单

Support(尿布→啤酒) = 100/1000 = 10%    (10%的订单同时购买)
Confidence(尿布→啤酒) = 100/200 = 50%  (买尿布的人50%也买啤酒)
Lift(尿布→啤酒) = 0.5/0.3 = 1.67       (正相关，比随机高67%)
```

---

<a name="项目4"></a>
## 项目 4: 销售数据的 RFM 客户价值分层

**难度**: 🔵 基础 | **分类**: 客户分析

### RFM 模型详解

RFM 是客户价值分析的经典模型：

| 维度 | Recency (R) | Frequency (F) | Monetary (M) |
|------|-------------|---------------|--------------|
| **含义** | 最近一次消费距今 | 消费频率 | 消费总额 |
| **计算** | `今天 - max(date)` | `nunique(order_id)` | `sum(amount)` |
| **方向** | 越小越好 | 越大越好 | 越大越好 |
| **业务** | "多久没来了？" | "来了多少次？" | "花了多少钱？" |

### 核心任务分解

#### 任务 1: 计算 RFM 值

```python
analysis_date = datetime(2024, 9, 1)

rfm = df.groupby('customer_id').agg({
    'date': lambda x: (analysis_date - x.max()).days,   # R: 天数
    'order_id': 'nunique',                               # F: 订单数
    'amount': 'sum'                                      # M: 总金额
}).rename(columns={'date': 'Recency', 'order_id': 'Frequency', 'amount': 'Monetary'})
```

#### 任务 2: qcut 分箱评分

```python
# 将 R/F/M 各分为 4 级 (1-4分)
# R: 天数越小越好 → 天数小的给高分 (4分)
rfm['R_score'] = pd.qcut(rfm['Recency'], 4, labels=[4, 3, 2, 1], duplicates='drop')

# F: 次数越大越好 → 次数大的给高分 (4分)
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 4, labels=[1, 2, 3, 4], duplicates='drop')

# M: 金额越大越好 → 金额大的给高分 (4分)
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), 4, labels=[1, 2, 3, 4], duplicates='drop')
```

**qcut 原理**:
```
原始金额: [50, 80, 100, 120, 150, 200, 300, 500]

等频分箱 (qcut, n=4):
  [50, 80]    → 第1分位 → 分数 1
  [100, 120]  → 第2分位 → 分数 2
  [150, 200]  → 第3分位 → 分数 3
  [300, 500]  → 第4分位 → 分数 4

每个分数段包含相同数量的客户
```

#### 任务 3: 客户分层

```python
def segment(row):
    if row['R_score'] >= 3 and row['F_score'] >= 3 and row['M_score'] >= 3:
        return '高价值活跃'     # R近、F高、M大
    elif row['R_score'] == 1:
        return '流失预警'       # 很久没来了
    elif row['F_score'] >= 3:
        return '高频用户'       # 经常来但花得少
    else:
        return '普通用户'
```

### 客户分层矩阵

```
                    低 Frequency           高 Frequency
                    ┌───────────────┬───────────────┐
        低 Monetary │  沉睡客户     │  高频低价客户  │
                    │  (R=1, F=3)   │  (R=3, F=4)   │
                    ├───────────────┼───────────────┤
        高 Monetary │  流失高价值   │  高价值活跃    │
                    │  (R=1, F=4)   │  (R=4, F=4)   │
                    └───────────────┴───────────────┘
```

---

<a name="项目5"></a>
## 项目 5: K-Means 聚类用户分群

**难度**: 🟡 中级 | **分类**: 聚类分析

### 为什么需要聚类？

RFM 分箱是**主观**的（人设定分箱边界），而 K-Means 是**客观**的（算法自动找边界）。

### K-Means 算法原理

```
步骤:
1. 选择 K 值（簇的数量）
2. 随机初始化 K 个中心点
3. 将每个数据点分配给最近的中心点
4. 重新计算每个簇的中心点（取均值）
5. 重复 3-4 直到中心点不再变化

可视化:
   Step 1: 随机选中心          Step 2: 分配数据点
   ×A        ×B                (A)       (B)
     ○  ○  ○  ○  ○              ○  ○    ○  ○  ○
     
   Step 3: 更新中心            Step 4: 收敛
   ×A'       ×B'               ●A        ●B
    (○○)     (○○○)              (○○)     (○○○)
```

### 核心任务分解

#### 任务 1: Z-Score 标准化

**为什么需要标准化？** R/F/M 的量纲不同（天数 vs 次数 vs 金额），距离计算会偏向数值大的维度。

```python
# 标准化公式: z = (x - mean) / std
for f in ['Recency', 'Frequency', 'Monetary']:
    df[f'{f}_z'] = (df[f] - df[f].mean()) / df[f].std()
```

**标准化效果**:
```
原始数据:                     标准化后:
Recency  Frequency  Monetary   Recency_z  Frequency_z  Monetary_z
  30       10        5000   →   -0.5        1.2          0.8
  90        2         200   →    1.5       -0.8         -0.6
  60        5        1500   →    0.5        0.3          0.2
  
  量纲不同 →                    统一量纲，均值为0，标准差为1
  不可直接计算距离 →             可用于距离计算
```

#### 任务 2: 手动实现 K-Means

```python
def kmeans(X, k, max_iter=100):
    np.random.seed(42)
    centers = X[np.random.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        # 计算距离
        distances = np.array([[norm(x - c) for c in centers] for x in X])
        # 分配标签
        labels = np.argmin(distances, axis=1)
        # 更新中心
        new_centers = np.array([X[labels == i].mean(axis=0) for i in range(k)])
        if np.allclose(centers, new_centers):
            break
        centers = new_centers
    return labels, centers
```

#### 任务 3: 分群业务解读

```python
# 分析每个簇的特征
cluster_stats = df.groupby('cluster')[['Recency', 'Frequency', 'Monetary']].mean()

# 示例解读:
# 簇0: R=15, F=12, M=3000 → "高价值活跃用户"
# 簇1: R=90, F=2,  M=300  → "低价值沉睡用户"
# 簇2: R=30, F=5,  M=1000 → "中价值稳定用户"
# 簇3: R=80, F=8,  M=2500 → "高价值流失预警"
# 簇4: R=10, F=1,  M=500  → "新晋潜力用户"
```

---

<a name="项目6"></a>
## 项目 6: 时间序列异常值检测

**难度**: 🟡 中级 | **分类**: 异常检测

### 项目背景

AI 告警系统发现昨日 GMV 暴跌。需要快速定位：
- 是哪个小时出了问题？
- 是"突刺"（暴涨）还是"断崖"（暴跌）？

### 核心概念

#### 滚动窗口 (Rolling Window)

```
时间序列:  [100, 120, 110, 130, 150, 200, 180, 140, 120, 110, ...]

window=3 的滚动均值:
  ┌─────┐
  [100, 120, 110] → mean = 110
         ┌─────┐
         [120, 110, 130] → mean = 120
                ┌─────┐
                [110, 130, 150] → mean = 130
                       ...
```

#### 异常判定规则

```python
# 使用 2σ (2倍标准差) 原则
# 正态分布下，95% 的数据在 μ±2σ 范围内

if value < mean - 2 * std:
    type = "断崖"  # 异常暴跌
elif value > mean + 2 * std:
    type = "突刺"  # 异常暴涨
```

### 核心任务分解

#### 任务 1: 按小时重采样

```python
# 将原始数据按小时汇总
hourly = df['gmv'].resample('H').sum()
```

#### 任务 2: 计算滚动均值与标准差

```python
rolling_mean = hourly.rolling(window=24, min_periods=1).mean()
rolling_std = hourly.rolling(window=24, min_periods=1).std().fillna(0)
```

#### 任务 3: 异常检测

```python
anomalies = []
for idx in df.index:
    val = hourly.loc[idx]
    mean = rolling_mean.loc[idx]
    std = rolling_std.loc[idx]
    
    if std > 0:
        if val < mean - 2 * std:
            anomalies.append({'time': idx, 'value': val, 'type': '断崖'})
        elif val > mean + 2 * std:
            anomalies.append({'time': idx, 'value': val, 'type': '突刺'})
```

### 异常检测可视化

```
GMV
  │
2500┤         * ← 突刺
  │        /│\
2000┤       / │ \
  │      /  │  \
1500┤     /   │   \
  │    /    │    \
1000┤───/─────┼─────\─────────── 均值线
  │  /      │      \    ╲
 500┤ /      │       \    ╲  ← 断崖
  │/       │        \    ╲
  0└───────┼─────────┼─────┼────→ 时间
           │         │
          12:00     30:00(凌晨6点)
```

---

<a name="项目7"></a>
## 项目 7: 多源数据融合归因分析

**难度**: 🟡 中级 | **分类**: 归因分析

### 项目背景

广告系统记录了用户的点击，电商系统记录了用户的订单。如何将两者关联，计算各广告渠道的贡献？

### 核心概念: 最后一次点击归因

**规则**: 将订单归因给用户下单前最近的一次广告点击。

```
用户行为时间线:
  09:00 [Google点击]     广告费: $2.50
  10:30 [Facebook点击]   广告费: $3.00
  11:00 [产生订单]       订单额: $500

归因结果: 订单 $500 → 归因给 Facebook（最后一次点击）
```

### merge_asof 详解

`pd.merge_asof()` 是**非精确时间匹配**的核心方法：

```python
attribution = pd.merge_asof(
    orders_sorted,    # 左表 (订单)
    clicks_sorted,    # 右表 (点击)
    on='user_id',     # 按用户匹配
    left_on='order_time',
    right_on='click_time',
    direction='backward'  # 取订单时间之前最近的点击
)
```

**参数说明**:

| 参数 | 作用 | 选项 |
|------|------|------|
| `direction='backward'` | 取左表时间之前最近的右表记录 | `backward`/`forward`/`nearest` |
| `allow_exact_matches` | 是否允许精确时间匹配 | `True`/`False` |

### 核心任务分解

#### 任务 1: merge_asof 关联

```python
# 必须先按时间排序！
clicks_sorted = clicks.sort_values('click_time')
orders_sorted = orders.sort_values('order_time')

attribution = pd.merge_asof(
    orders_sorted, clicks_sorted,
    on='user_id',
    left_on='order_time',
    right_on='click_time',
    direction='backward'
)
```

#### 任务 2: 渠道 ROI 计算

```python
channel_stats = attribution.groupby('channel').agg(
    orders=('user_id', 'count'),
    revenue=('amount', 'sum'),
    cost=('cost', 'sum')
)
channel_stats['roi'] = (channel_stats['revenue'] - channel_stats['cost']) / channel_stats['cost']
```

---

<a name="项目8"></a>
## 项目 8: 文本评论情感极性清洗与分词

**难度**: 🔵 基础 | **分类**: 文本处理

### 项目背景

为 NLP 情感分析模型准备训练数据，需要清洗评论中的 HTML 标签、表情符号等噪声。

### 核心任务分解

#### 任务 1: 正则清洗

```python
def clean_text(text):
    if pd.isna(text):
        return ''
    # 1. 去除 HTML 标签
    text = re.sub(r'<[^>]+>', '', str(text))
    # 2. 去除表情和特殊字符 (保留中文、英文、数字、标点)
    text = re.sub(r'[^\w\s，。！？、；：""''（）【】《》]', '', text)
    return text.strip()
```

**正则表达式解析**:
- `<[^>]+>`: 匹配 `<` 开头、`>` 结尾的任意 HTML 标签
- `[^\w\s...]`: 匹配**不**在集合中的字符（`^` 表示取反）
- `\w`: 字母、数字、下划线
- `\s`: 空白字符

#### 任务 2: 分词处理

```python
# 中文按字符切分 (简化版，实际生产应使用 jieba)
df['words'] = df['clean_comment'].apply(
    lambda x: list(x) if x else []
)
```

#### 任务 3: 停用词过滤

```python
stop_words = {'的', '了', '吧', '是', '太', '非常', '很', '这', '那', '都', '也', '还'}

df['filtered_words'] = df['words'].apply(
    lambda words: [w for w in words if w not in stop_words]
)

# NaN 填充为空列表
df['filtered_words'] = df['filtered_words'].apply(lambda x: x if x else [])
```

**什么是停用词？**
停用词是文本中出现频率高但对语义贡献小的词，在文本分析中通常需要过滤掉。

---

<a name="项目9"></a>
## 项目 9: 帕累托分析商品贡献度

**难度**: 🔵 基础 | **分类**: 贡献度分析

### 帕累托法则 (80/20 法则)

意大利经济学家帕累托发现：
- 80% 的财富由 20% 的人掌握
- 在商业中：80% 的销售额来自 20% 的商品

### 核心任务分解

#### 任务 1: 计算单品销售额

```python
product_sales = df.groupby('product')['sales'].sum().sort_values(ascending=False)
```

#### 任务 2: 计算累计占比

```python
total_sales = product_sales.sum()
cumulative = product_sales.cumsum()       # 累计求和
cumulative_pct = cumulative / total_sales # 累计占比
```

**计算过程示例**:
```
商品     销售额    累计销售额    累计占比
商品A    5000      5000         25%
商品B    4500      9500         47.5%
商品C    3500      13000        65%
商品D    3000      16000        80%  ← 分界点
商品E    1500      17500        87.5%
...
```

#### 任务 3: 商品分类

```python
def classify(pct):
    if pct <= 80:
        return '爆款 (Top 20%)'
    elif pct <= 95:
        return '腰部商品'
    else:
        return '长尾商品'

pareto['category'] = pareto['cumulative_pct'].apply(classify)
```

### 帕累托曲线

```
累计销售额占比
  │
100%┤                              ┌─── 长尾 (5%贡献, 大量商品)
    │                          ┌──┘
 95%┤                      ┌──┘
    │                  ┌──┘
 80%┤              ┌──┘  ← 分界点: 20%商品贡献80%销售额
    │          ┌──┘
 60%┤      ┌──┘
    │  ┌──┘
 20%┤──┘  ← 爆款 (少量高贡献)
    │
  0%└──────────────────────────→ 商品排名
     爆款     腰部        长尾
```

---

<a name="项目10"></a>
## 项目 10: 端到端实战 — 购物篮聚类与推荐报告

**难度**: 🔴 高级 | **分类**: 综合实战

### 项目概述

整合前面所有技能，完成一个完整的数据分析项目：

```
┌──────────────────────────────────────────────────────┐
│                   完整分析流程                         │
│                                                      │
│  订单数据 → 商品共现矩阵 → 用户品类偏好 → 聚类分析     │
│       ↓           ↓              ↓            ↓      │
│   数据读取    矩阵乘法        交叉表        K-Means    │
│                                                      │
│                     ↓                                │
│              业务洞察报告                              │
│  "第2类用户(15%)偏好母婴+清洁,建议做交叉销售弹窗"       │
└──────────────────────────────────────────────────────┘
```

### 核心任务分解

#### 任务 1: 商品共现矩阵

```python
# 构建 品类 × 订单 的交叉表
pivot = pd.crosstab(df['order_id'], df['category'])

# 矩阵乘法得到共现矩阵
# pivot.T (6×50) × pivot (50×6) = 共现矩阵 (6×6)
cooccurrence = pivot.T.dot(pivot)
np.fill_diagonal(cooccurrence.values, 0)  # 自身共现设为0
```

**矩阵乘法原理**:
```
pivot (品类 × 订单):
        订单1  订单2  订单3  订单4  ...
母婴      1      0      1      0
清洁      1      0      1      1
食品      0      1      0      1
...

共现矩阵 = pivot.T × pivot:
        母婴  清洁  食品
母婴     0    2     0    ← 母婴和清洁在2个订单中共现
清洁     2    0     1    ← 清洁和食品在1个订单中共现
食品     0    1     0
```

#### 任务 2: 用户品类偏好聚类

```python
# 交叉表: 用户 × 品类 (One-Hot)
user_pref = pd.crosstab(df['order_id'], df['category'])

# 标准化
user_pref_norm = (user_pref - user_pref.mean()) / user_pref.std()

# K-Means 聚类
labels = kmeans(user_pref_norm.values, k=3)
user_pref['cluster'] = labels
```

#### 任务 3: 业务洞察报告

```python
for c in range(3):
    cluster = user_pref[user_pref['cluster'] == c]
    prefs = cluster.mean().drop('cluster')
    top_cat = prefs.idxmax()
    n_users = len(cluster)
    pct = n_users / len(user_pref) * 100
    sec_cat = prefs.drop(top_cat).idxmax()
    
    print(f"聚类{c} ({pct:.0f}%用户)")
    print(f"  主偏好: {top_cat}")
    print(f"  次偏好: {sec_cat}")
    print(f"  💡 建议: 在{top_cat}页面推荐{sec_cat}商品")
```

**示例输出**:
```
📊 购物篮聚类与个性化推荐报告

📌 聚类0 (35%用户)
   主偏好: 食品
   次偏好: 清洁
   💡 建议: 在食品页面推荐清洁商品

📌 聚类1 (25%用户)
   主偏好: 母婴
   次偏好: 清洁
   💡 建议: 在母婴页面推荐清洁商品 (交叉销售)

📌 聚类2 (40%用户)
   主偏好: 数码
   次偏好: 服饰
   💡 建议: 在数码页面推荐服饰商品
```

### 业务洞察模板

> **聚类结果发现**: 第 1 类用户（占比 25%）高度偏好母婴用品且常与清洁用品共现。建议在购物车页面做**交叉销售 (Cross-Sell)** 弹窗，当用户购买母婴商品时推荐清洁用品。预计转化率提升 15-20%。

---

## 附录: 技能矩阵

| 项目 | 数据读取 | 数据清洗 | 数据转换 | 分组聚合 | 可视化 | 机器学习 | 业务解读 |
|------|:--------:|:--------:|:--------:|:--------:|:------:|:--------:|:--------:|
| 1 | ✅ | ✅✅ | ✅ | | | | ✅ |
| 2 | ✅ | | ✅✅ | ✅ | | | ✅ |
| 3 | ✅ | | | ✅ | | ✅ | ✅ |
| 4 | ✅ | | | ✅✅ | | ✅ | ✅✅ |
| 5 | ✅ | ✅ | | ✅ | ✅ | ✅✅ | ✅✅ |
| 6 | ✅ | | ✅ | | ✅ | | ✅ |
| 7 | ✅✅ | | ✅✅ | ✅ | | | ✅✅ |
| 8 | ✅ | ✅✅ | ✅ | | | | |
| 9 | ✅ | | | ✅ | ✅ | | ✅ |
| 10 | ✅ | | ✅✅ | ✅✅ | ✅ | ✅✅ | ✅✅✅ |

- ✅: 涉及
- ✅✅: 重点掌握
- ✅✅✅: 核心能力
