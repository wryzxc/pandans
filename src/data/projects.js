export const categories = [
  { id: 'all', name: '全部项目', icon: '📦' },
  { id: 'beginner', name: '简单入门', icon: '🟢' },
  { id: 'basic', name: '基础案例', icon: '🔵' },
  { id: 'intermediate', name: '中级实战', icon: '🟡' },
  { id: 'advanced', name: '综合实战', icon: '🔴' }
]

// 七大模块通用结构定义
// background: 项目背景（起源/受众/环境/问题/意义/行业数据）
// tasks: 核心任务清单（目标/责任主体/时间节点/关键成果物）
// knowledge: 详细知识讲解（基础理论/实践应用/前沿发展）
// concepts: 概念解析（内涵外延/术语辨析/应用场景/关联关系）
// techPoints: 技术要点（选型依据/关键参数/实现方法/风险策略）
// completionCriteria: 完成标准（功能/性能/质量/安全/文档/体验）
// chapterLearning: 章节学习（与知识点对应的示例代码/代码说明/运行演示）

export const projects = [
  {
    id: 1,
    name: '电商订单脏数据清洗与标准化',
    difficulty: 'beginner',
    tags: ['正则清洗', '缺失值处理', '类型转换', 'apply/lambda'],
    category: '数据清洗',

    background: {
      description: '处理编码错误、统一金额格式、填充缺失ID、转换日期格式，掌握数据清洗核心技能。',
      origin: '随着跨境电商的快速发展，企业普遍面临多源异构订单数据整合难题。据商务部《2024年中国跨境电商报告》显示，中国跨境电商交易规模已达2.38万亿元，同比增长15.6%。海外仓系统通常由不同供应商建设，导致数据格式标准不统一，为后续的数据分析和业务决策带来巨大障碍。',
      audience: '数据分析师、电商运营人员、数据工程师、业务分析师。',
      environment: '多源海外仓系统数据整合、跨境电商订单管理、ERP系统数据迁移。',
      problem: '原始CSV文件来自多个海外仓系统，存在字段错位、空值逻辑各异、金额单位混乱（美元$、欧元€）、日期格式不统一（YYYY-MM-DD与MM/DD/YYYY混用）等严重质量问题，导致数据无法直接用于分析建模。',
      significance: '数据清洗是数据分析流程中最耗时但最关键的环节，占据数据科学项目60%-80%的时间（Forrester Research）。掌握数据清洗技能是成为合格数据分析师的前提条件。',
      industryData: '根据Gartner研究，低质量数据导致企业平均每年损失1500万美元；据《2023年中国数据治理白皮书》，93%的企业认为数据质量问题是数字化转型的主要障碍。'
    },

    tasks: [
      {
        goal: '使用 pd.read_csv 处理编码错误与分隔符问题，成功读取多格式CSV文件',
        responsible: '数据分析师',
        timeline: '第1步，预计15分钟',
        deliverable: '成功加载的DataFrame，无编码报错'
      },
      {
        goal: '利用 str.replace + 正则表达式统一 "$1,200.00" 和 "€850.5" 格式并转为数值型',
        responsible: '数据分析师',
        timeline: '第2步，预计20分钟',
        deliverable: '金额列转换为float类型，所有货币符号和千分位已移除'
      },
      {
        goal: '针对缺失的customer_id，采用"若订单金额>0但ID缺失则标记为Guest_随机数"逻辑填充',
        responsible: '数据分析师',
        timeline: '第3步，预计15分钟',
        deliverable: 'customer_id列无空值，Guest用户标记符合业务规则'
      },
      {
        goal: '使用 pd.to_datetime 强制转换多种日期格式并剔除未来日期',
        responsible: '数据分析师',
        timeline: '第4步，预计15分钟',
        deliverable: 'order_date列为datetime类型，无未来日期记录'
      }
    ],

    knowledge: {
      theory: '数据清洗（Data Cleaning）是数据预处理的核心环节，旨在识别并修正数据中的错误、不一致和缺失值。根据Piper等人（2018）的定义，数据清洗包括格式标准化、缺失值处理、异常值检测和重复值消除四个主要维度。Pandas 提供了read_csv、to_datetime、fillna、dropna等核心方法，配合Python正则表达式模块re，可高效完成各类清洗任务。',
      practice: '在电商场景中，数据清洗通常遵循"读取→诊断→清洗→验证"四步流程。首先使用df.info()和df.describe()进行数据诊断，然后针对不同类型的脏数据采用不同策略：文本格式问题用正则处理，数值异常用统计方法检测，日期混乱用to_datetime统一解析。清洗后必须通过df.isna().sum()和唯一值检查进行质量验证。',
      frontier: '当前数据清洗前沿包括：AI辅助自动清洗（如Trifacta的ML清洗引擎）、基于规则引擎的自动化清洗（Great Expectations框架）、以及端到端数据质量管道（dbt Tests）。Pandas 2.0引入的pyarrow引擎大幅提升了大规模数据清洗性能。'
    },

    concepts: {
      definitions: {
        '脏数据 (Dirty Data)': '指存在格式错误、缺失值、异常值或逻辑冲突的数据记录。根据DAMA国际数据管理协会定义，脏数据包含七类：缺失值、错误值、重复值、不一致值、过期值、不完整值和无效值。',
        '缺失值 (Missing Value)': '数据集中未记录或未知的值。Pandas中用NaN（Not a Number）表示数值型缺失，用NaT（Not a Time）表示时间型缺失，用None表示对象型缺失。缺失机制分为三类：完全随机缺失（MCAR）、随机缺失（MAR）和非随机缺失（MNAR）。',
        '正则表达式 (Regular Expression)': '一种用于匹配字符串模式的语法规范，在数据清洗中用于格式标准化、子串提取和模式匹配。常用模式：\\d匹配数字，\\w匹配单词字符，[^]匹配否定字符集。',
        'apply/lambda': 'apply()是Pandas的高阶函数，将指定函数应用于Series或DataFrame的每个元素。lambda是Python的匿名函数语法，常用于简洁地定义单行转换函数。二者结合可实现灵活的数据转换。'
      },
      relationships: '数据清洗是ETL流程中Transform环节的核心；缺失值处理是数据清洗的子集；正则表达式是格式标准化的工具；apply/lambda是实现批量转换的方法。四者形成"发现问题→分析原因→选择工具→实施处理"的完整链条。'
    },

    techPoints: {
      selection: '选择Pandas + Python re模块作为技术栈。Pandas是Python数据分析的事实标准，拥有最丰富的数据清洗API；re模块是Python标准库，支持完整的正则表达式语法。相比OpenRefine等GUI工具，代码方式更具可复现性和可自动化性。',
      parameters: 'pd.read_csv关键参数：encoding（编码）、sep（分隔符）、dtype（类型）、na_values（缺失值标识）；pd.to_datetime关键参数：format（日期格式）、errors（错误处理策略：raise/coerce/ignore）。',
      methods: '①正则清洗：re.sub(r\'[^\\d.]\', \'\', value) 移除非数字字符；②缺失值填充：iterrows()遍历 + 条件判断实现业务规则填充；③类型转换：apply(clean_amount)批量处理金额列；④日期解析：pd.to_datetime(format=None, errors=\'coerce\')自动推断格式。',
      risks: '风险1：正则表达式过度匹配导致数据丢失（应对：先在小样本上验证）；风险2：Pyodide中Pandas版本限制（应对：避免使用format=\'mixed\'等新特性）；风险3：大规模数据iterrows()性能差（应对：优先使用向量化操作）。'
    },

    completionCriteria: {
      functional: '成功读取CSV文件，金额列转为float，customer_id无空值，日期列为datetime类型，未来日期已剔除。',
      performance: '在浏览器环境下，1000行数据清洗时间不超过5秒；内存占用不超过50MB。',
      quality: '清洗后数据无NaN（业务允许的特殊标记除外）；所有金额值≥0；所有日期≤当前日期；数据类型与Schema定义一致。',
      security: '不涉及敏感个人信息的直接暴露；Guest用户ID使用随机数而非可预测序列。',
      documentation: '代码包含关键步骤注释；输出结果包含清洗前后的数据对比。',
      experience: '代码可一键运行；输出结果格式清晰易读；错误信息明确可定位。'
    },

    chapterLearning: [
      {
        title: '1.1 Pandas 数据读取与诊断',
        description: '学习使用 pd.read_csv 读取数据，并用 df.info() 和 df.describe() 进行数据诊断。',
        code: `import pandas as pd
import numpy as np

# 创建示例数据
data = {
    'name': ['Alice', 'Bob', 'Charlie', None, 'Eve'],
    'age': [25, 30, np.nan, 28, 35],
    'salary': ['$50,000', '$60,000', '$55,000', '$70,000', None]
}
df = pd.DataFrame(data)

# 数据诊断
print("=== 数据基本信息 ===")
print(df.info())
print("\\n=== 统计描述 ===")
print(df.describe())
print("\\n=== 缺失值统计 ===")
print(df.isna().sum())`,
        keyPoints: ['pd.DataFrame() 创建数据框', 'df.info() 查看数据类型和非空值', 'df.describe() 统计数值列', 'df.isna().sum() 统计缺失值']
      },
      {
        title: '1.2 正则表达式清洗文本',
        description: '使用 re.sub 和 str.replace 清洗文本数据，移除货币符号和千分位。',
        code: `import pandas as pd
import re

# 模拟含货币符号的数据
df = pd.DataFrame({
    'price': ['$1,200.00', '€850.5', '$3,450.75', '€120.0']
})

# 方法1: 使用 re.sub 清洗
def clean_price(val):
    if pd.isna(val):
        return None
    # 移除非数字和小数点的字符
    cleaned = re.sub(r'[^\\d.]', '', str(val))
    return float(cleaned) if cleaned else None

df['price_clean'] = df['price'].apply(clean_price)

print("原始数据:")
print(df['price'])
print("\\n清洗后:")
print(df['price_clean'])
print("\\n数据类型:", df['price_clean'].dtype)`,
        keyPoints: ['re.sub(pattern, repl, string) 正则替换', 'str(val) 确保输入为字符串', 'float() 转换为数值类型', 'apply() 批量应用函数']
      },
      {
        title: '1.3 缺失值处理策略',
        description: '掌握 fillna、dropna 和条件填充等缺失值处理方法。',
        code: `import pandas as pd
import numpy as np

# 创建含缺失值的数据
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4],
    'B': ['x', None, 'z', 'w'],
    'C': [10, 20, 30, np.nan]
})

print("原始数据:")
print(df)

# 方法1: 删除含缺失值的行
df_drop = df.dropna()
print("\\n删除缺失值后:")
print(df_drop)

# 方法2: 用固定值填充
df_fill = df.fillna({'A': 0, 'B': 'unknown', 'C': df['C'].mean()})
print("\\n填充缺失值后:")
print(df_fill)

# 方法3: 条件填充
df['A_filled'] = df['A'].fillna(df['A'].median())
print("\\n用中位数填充A列:")
print(df[['A', 'A_filled']])`,
        keyPoints: ['dropna() 删除缺失值', 'fillna() 填充缺失值', 'fillna(dict) 按列指定填充值', 'median()/mean() 统计值填充']
      },
      {
        title: '1.4 日期时间处理',
        description: '使用 pd.to_datetime 统一解析多种日期格式，并进行日期运算。',
        code: `import pandas as pd
from datetime import datetime

# 多种日期格式
dates = ['2024-01-15', '01/20/2024', '2024-02-01 10:30', '03/01/2024']
df = pd.DataFrame({'raw_date': dates})

# 自动解析日期
df['parsed_date'] = pd.to_datetime(df['raw_date'], errors='coerce')

print("原始日期:")
print(df['raw_date'])
print("\\n解析后:")
print(df['parsed_date'])
print("\\n数据类型:", df['parsed_date'].dtype)

# 日期运算
today = datetime.now()
df['days_ago'] = (today - df['parsed_date']).dt.days
print("\\n距今天数:")
print(df[['parsed_date', 'days_ago']])

# 筛选未来日期
df['is_future'] = df['parsed_date'] > today
print("\\n是否未来日期:")
print(df[['parsed_date', 'is_future']])`,
        keyPoints: ['pd.to_datetime() 自动解析日期', 'errors="coerce" 将无法解析的转为NaT', 'dt.days 获取天数差', '日期可以直接比较大小']
      }
    ],

    initialCode: `import pandas as pd
import re
from datetime import datetime
import numpy as np
import random

# 模拟脏数据
data = {
    'order_id': ['001', '002', '003', '004', '005', '006', '007'],
    'customer_id': ['C101', 'C102', None, 'C104', None, 'C106', 'C107'],
    'amount': ['$1,200.00', '€850.5', '$3,450.75', '€120.0', '$560.30', None, '$2,100.00'],
    'order_date': ['2024-01-15', '01/20/2024', '2024-02-01', '2024-02-15', '03/01/2024', '2024-03-20', '2025-12-01'],
    'warehouse': ['US-WEST', 'EU-CENTRAL', 'US-EAST', 'EU-WEST', 'US-WEST', 'EU-CENTRAL', 'US-EAST']
}
df = pd.DataFrame(data)
print("原始数据:")
print(df)
print()

# 任务1: 统一金额格式并转为数值型
def clean_amount(val):
    if pd.isna(val):
        return None
    val = re.sub(r'[^\\d.]', '', str(val))
    return float(val) if val else None

df['amount'] = df['amount'].apply(clean_amount)
print("清洗金额后:")
print(df[['order_id', 'amount']])
print()

# 任务2: 填充缺失的customer_id
for idx, row in df.iterrows():
    if pd.isna(row['customer_id']):
        if row['amount'] and row['amount'] > 0:
            df.at[idx, 'customer_id'] = 'Guest_%d' % random.randint(1000, 9999)
        else:
            df.at[idx, 'customer_id'] = 'Unknown'

print("填充customer_id后:")
print(df[['order_id', 'customer_id', 'amount']])
print()

# 任务3: 转换日期并剔除未来日期
df['order_date'] = pd.to_datetime(df['order_date'], format=None, errors='coerce')
today = datetime.now()
df = df[df['order_date'] <= today]

print("最终数据:")
print(df)
print("\\n清洗完成! 共处理 %d 条有效记录" % len(df))`,

    referenceCode: `import pandas as pd
import re
from datetime import datetime
import numpy as np
import random

# 模拟脏数据
data = {
    'order_id': ['001', '002', '003', '004', '005', '006', '007'],
    'customer_id': ['C101', 'C102', None, 'C104', None, 'C106', 'C107'],
    'amount': ['$1,200.00', '€850.5', '$3,450.75', '€120.0', '$560.30', None, '$2,100.00'],
    'order_date': ['2024-01-15', '01/20/2024', '2024-02-01', '2024-02-15', '03/01/2024', '2024-03-20', '2025-12-01'],
    'warehouse': ['US-WEST', 'EU-CENTRAL', 'US-EAST', 'EU-WEST', 'US-WEST', 'EU-CENTRAL', 'US-EAST']
}
df = pd.DataFrame(data)

# 清洗金额
def clean_amount(val):
    if pd.isna(val): return None
    val = re.sub(r'[^\\d.]', '', str(val))
    return float(val) if val else None

df['amount'] = df['amount'].apply(clean_amount)

# 填充customer_id
for idx, row in df.iterrows():
    if pd.isna(row['customer_id']):
        if row['amount'] and row['amount'] > 0:
            df.at[idx, 'customer_id'] = 'Guest_%d' % random.randint(1000, 9999)

# 转换日期并剔除未来日期
df['order_date'] = pd.to_datetime(df['order_date'], format=None, errors='coerce')
df = df[df['order_date'] <= datetime.now()]

print("清洗完成! 最终记录数:", len(df))
print(df)`
  },

  {
    id: 2,
    name: '用户行为日志的透视重塑',
    difficulty: 'beginner',
    tags: ['pivot_table', 'shift窗口', 'NaN填充', 'groupby'],
    category: '数据重塑',

    background: {
      description: '将长格式用户行为数据重塑为宽表特征，计算行为间隔与会话窗口。',
      origin: '在用户行为分析领域，点击流数据通常以事件日志的形式存储，即每条记录代表一个用户行为事件。随着互联网用户规模的爆发式增长，据CNNIC第53次报告显示，中国网民规模已达10.92亿，海量行为数据的高效分析成为企业核心竞争力。',
      audience: '用户研究员、数据产品经理、增长黑客、推荐算法工程师。',
      environment: '用户行为分析平台、产品迭代优化、用户画像构建、推荐系统特征工程。',
      problem: '用户点击流数据是典型的"长格式"数据，无法直接做相关性分析。需要将(user_id, action_type)转为列（如点击次数、加购次数、收藏次数），并计算行为时间间隔与会话窗口，为AI模型训练准备宽表特征。',
      significance: '数据重塑是将原始日志转化为分析就绪数据的关键步骤。正确的数据组织方式可使分析效率提升数倍，并直接影响机器学习模型的输入质量。',
      industryData: '根据McKinsey报告，数据准备（含重塑）占据数据科学项目60%的时间；GAFA等科技巨头的数据平台中，数据重塑引擎是核心组件。'
    },

    tasks: [
      {
        goal: '使用 groupby + pivot_table 将(user_id, action_type)转为宽表列',
        responsible: '数据分析师',
        timeline: '第1步，预计20分钟',
        deliverable: '宽格式DataFrame，每行一个用户，列为各行为类型计数'
      },
      {
        goal: '计算每个用户的行为时间间隔（diff）',
        responsible: '数据分析师',
        timeline: '第2步，预计15分钟',
        deliverable: '新增time_diff列，显示相邻行为的时间差'
      },
      {
        goal: '使用 shift + cumsum 实现会话窗口切割（30分钟无操作视为新会话）',
        responsible: '数据分析师',
        timeline: '第3步，预计20分钟',
        deliverable: '新增session_id列，正确标识每个行为所属会话'
      },
      {
        goal: '处理重塑产生的NaN值，填充为0',
        responsible: '数据分析师',
        timeline: '贯穿全程',
        deliverable: '宽表中无NaN值，未发生的行为计数为0'
      }
    ],

    knowledge: {
      theory: '数据重塑（Data Reshaping）是将数据从一种组织形式转换为另一种形式的过程。长格式（Long/Tidy Format）每行一条记录，适合存储；宽格式（Wide Format）每行一个实体、每列一个属性，适合分析。pivot_table是Excel透视表在Pandas中的实现，基于split-apply-combine范式。',
      practice: 'pivot_table(index, columns, values, aggfunc)是最常用的重塑方法。长转宽时，index指定行分组字段，columns指定列展开字段，values指定聚合值，aggfunc指定聚合方式（count/sum/mean）。配合fill_value=0处理缺失组合。',
      frontier: '当前前沿包括：Polars库的lazy evaluation重塑（性能优于Pandas 10倍）、Dask的分布式pivot、以及基于SQL的窗口函数重塑。Google的BigQuery和Snowflake均提供强大的原生重塑能力。'
    },

    concepts: {
      definitions: {
        '长格式 (Long Format)': '也称Tidy Data，每行一个观测、每列一个变量。适合数据存储和追加，但不适合横向分析。Hadley Wickham在2014年提出Tidy Data概念，成为R/Python数据科学的标准数据组织形式。',
        '宽格式 (Wide Format)': '每行一个实体（如用户），每列一个属性（如行为计数）。适合统计分析、机器学习建模和数据可视化，但不利于数据扩展。',
        '透视表 (Pivot Table)': '一种数据汇总工具，可将长格式数据按指定维度聚合后转为宽格式。核心操作是：按index分组、按columns展开、对values聚合。',
        '会话窗口 (Session Window)': '用户连续活动的时段，通常以固定无活动时长（如30分钟）为分割点。是用户行为分析的基本单元，用于计算会话级指标如跳出率、转化路径等。'
      },
      relationships: '长宽格式是数据组织的两种基本形态，可通过pivot_table互相转换。会话窗口切割是基于时间排序后的逻辑分组，为后续的用户行为序列分析奠定基础。NaN填充是重塑后的必要后处理步骤。'
    },

    techPoints: {
      selection: '选择Pandas pivot_table而非reshape/melt，因为pivot_table一步完成分组+聚合+展开。选择groupby+diff计算时间间隔，利用Pandas对datetime的原生支持。会话窗口使用transform+cumsum实现，避免显式循环。',
      parameters: 'pivot_table关键参数：index（行分组）、columns（列展开）、aggfunc（聚合函数，默认mean）、fill_value（缺失填充值）。groupby.diff()自动返回Timedelta类型。',
      methods: '①pivot_table实现长转宽；②groupby+diff计算组内时间差；③transform+lambda判断新会话起始；④cumsum累计求和生成会话ID。',
      risks: '风险1：pivot_table在用户×行为组合过多时产生稀疏矩阵（应对：先用value_counts筛选高频行为）；风险2：diff()对未排序数据结果错误（应对：先sort_values）；风险3：大数量级pivot内存溢出（应对：使用categorical类型减少内存）。'
    },

    completionCriteria: {
      functional: '成功将长格式转为宽格式；time_diff列正确计算相邻行为时间差；session_id正确标识会话边界。',
      performance: '10万行行为日志的透视重塑不超过10秒；内存峰值不超过200MB。',
      quality: '宽表中NaN已填充为0；time_diff无NaT异常；session_id连续递增无跳变。',
      security: '用户行为数据脱敏处理（user_id使用哈希而非明文）。',
      documentation: '代码注释说明长宽格式转换逻辑；输出包含重塑前后对比。',
      experience: '代码模块化，每步有中间结果打印；会话切割逻辑清晰易懂。'
    },

    chapterLearning: [
      {
        title: '2.1 pivot_table 数据透视',
        description: '学习使用 pivot_table 将长格式数据转为宽格式，掌握 index/columns/values/aggfunc 参数。',
        code: `import pandas as pd

# 长格式数据
data = {
    'user_id': [1, 1, 1, 2, 2, 3],
    'action': ['click', 'cart', 'buy', 'click', 'buy', 'click'],
    'timestamp': pd.to_datetime([
        '2024-01-01 10:00', '2024-01-01 10:05', '2024-01-01 10:15',
        '2024-01-02 14:00', '2024-01-02 14:30',
        '2024-01-03 09:00'
    ])
}
df = pd.DataFrame(data)

# pivot_table 长转宽
pivot = df.pivot_table(
    index='user_id',
    columns='action',
    values='timestamp',
    aggfunc='count',
    fill_value=0
)

print("透视后的宽表:")
print(pivot)
print("\\n索引:", pivot.index.tolist())
print("列名:", pivot.columns.tolist())`,
        keyPoints: ['index 指定行分组字段', 'columns 指定列展开字段', 'aggfunc 指定聚合方式', 'fill_value 填充缺失值']
      },
      {
        title: '2.2 groupby + diff 计算组内差值',
        description: '使用 groupby 分组后，用 diff() 计算每个用户相邻行为的时间间隔。',
        code: `import pandas as pd

# 用户行为数据
df = pd.DataFrame({
    'user_id': [1, 1, 1, 2, 2],
    'action': ['click', 'cart', 'buy', 'click', 'buy'],
    'timestamp': pd.to_datetime([
        '2024-01-01 10:00', '2024-01-01 10:05', '2024-01-01 10:15',
        '2024-01-02 14:00', '2024-01-02 14:30'
    ])
})

# 先按用户和时间排序
df = df.sort_values(['user_id', 'timestamp'])

# 计算每个用户相邻行为的时间差
df['time_diff'] = df.groupby('user_id')['timestamp'].diff()

print("时间间隔计算结果:")
print(df[['user_id', 'action', 'timestamp', 'time_diff']])
print("\\ntime_diff 数据类型:", df['time_diff'].dtype)`,
        keyPoints: ['sort_values() 先排序再计算', 'groupby().diff() 计算组内差值', 'diff() 自动处理组边界为NaN', 'Timedelta 类型支持时间运算']
      },
      {
        title: '2.3 cumsum 累计求和与会话切割',
        description: '使用 transform + cumsum 实现会话窗口切割，将连续行为分组为会话。',
        code: `import pandas as pd

# 用户行为数据
df = pd.DataFrame({
    'user_id': [1, 1, 1, 1, 2, 2],
    'timestamp': pd.to_datetime([
        '2024-01-01 10:00', '2024-01-01 10:05',
        '2024-01-01 11:00', '2024-01-01 11:05',
        '2024-01-02 14:00', '2024-01-02 15:00'
    ])
})

# 计算时间差
df = df.sort_values(['user_id', 'timestamp'])
df['time_diff'] = df.groupby('user_id')['timestamp'].diff()

# 判断是否为新的会话（间隔超过30分钟）
df['new_session'] = df.groupby('user_id')['timestamp'].transform(
    lambda x: x.diff() > pd.Timedelta('30min')
)

# 累计求和生成会话ID
df['session_id'] = df.groupby('user_id')['new_session'].cumsum()

print("会话划分结果:")
print(df[['user_id', 'timestamp', 'time_diff', 'new_session', 'session_id']])`,
        keyPoints: ['transform() 保持原始DataFrame形状', 'Timedelta("30min") 定义时间阈值', 'cumsum() 将布尔值转为递增ID', 'lambda 实现自定义判断逻辑']
      },
      {
        title: '2.4 NaN 值处理与数据验证',
        description: '学习使用 fillna 处理透视产生的缺失值，并验证数据质量。',
        code: `import pandas as pd
import numpy as np

# 含缺失值的数据
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4],
    'B': [np.nan, 2, 3, 4],
    'C': [1, np.nan, np.nan, 4]
})

print("原始数据:")
print(df)
print("\\n缺失值统计:")
print(df.isna().sum())

# 用固定值填充
df_filled = df.fillna(0)
print("\\n填充0后:")
print(df_filled)

# 用列均值填充
df_mean = df.fillna(df.mean())
print("\\n用均值填充后:")
print(df_mean)

# 检查是否还有缺失值
print("\\n是否还有缺失值:", df_mean.isna().sum().sum() == 0)`,
        keyPoints: ['fillna(0) 用固定值填充', 'fillna(df.mean()) 用统计值填充', 'isna().sum() 统计每列缺失数', '双重sum() 统计整个DataFrame缺失数']
      }
    ],

    initialCode: `import pandas as pd
import numpy as np

# 模拟用户行为长格式数据
data = {
    'user_id': [1, 1, 1, 2, 2, 3, 3, 3, 4, 4],
    'action': ['click', 'cart', 'buy', 'click', 'buy', 'click', 'fav', 'buy', 'click', 'cart'],
    'timestamp': pd.to_datetime([
        '2024-01-01 10:00', '2024-01-01 10:05', '2024-01-01 10:15',
        '2024-01-02 14:00', '2024-01-02 14:30',
        '2024-01-03 09:00', '2024-01-03 09:10', '2024-01-03 09:25',
        '2024-01-04 16:00', '2024-01-04 16:08'
    ])
}
df = pd.DataFrame(data)
print("原始长格式数据:")
print(df)
print()

# 任务1: 使用pivot_table转为宽表
pivot = df.pivot_table(
    index='user_id',
    columns='action',
    values='timestamp',
    aggfunc='count',
    fill_value=0
)
pivot.columns = ['%s_count' % col for col in pivot.columns]
print("透视后的宽表:")
print(pivot)
print()

# 任务2: 计算用户行为时间间隔
df = df.sort_values(['user_id', 'timestamp'])
df['time_diff'] = df.groupby('user_id')['timestamp'].diff()
print("时间间隔:")
print(df[['user_id', 'action', 'timestamp', 'time_diff']])
print()

# 任务3: 会话窗口切割 (30分钟无操作视为新会话)
df['new_session'] = df.groupby('user_id')['timestamp'].transform(
    lambda x: x.diff() > pd.Timedelta('30min')
)
df['session_id'] = df.groupby('user_id')['new_session'].cumsum()
print("会话划分结果:")
print(df[['user_id', 'action', 'timestamp', 'session_id']])
print("\\n✅ 数据重塑完成!")`,

    referenceCode: `import pandas as pd
import numpy as np

data = {
    'user_id': [1, 1, 1, 2, 2, 3, 3, 3, 4, 4],
    'action': ['click', 'cart', 'buy', 'click', 'buy', 'click', 'fav', 'buy', 'click', 'cart'],
    'timestamp': pd.to_datetime([
        '2024-01-01 10:00', '2024-01-01 10:05', '2024-01-01 10:15',
        '2024-01-02 14:00', '2024-01-02 14:30',
        '2024-01-03 09:00', '2024-01-03 09:10', '2024-01-03 09:25',
        '2024-01-04 16:00', '2024-01-04 16:08'
    ])
}
df = pd.DataFrame(data)

pivot = df.pivot_table(index='user_id', columns='action', values='timestamp', aggfunc='count', fill_value=0)
pivot.columns = ['%s_count' % col for col in pivot.columns]

df = df.sort_values(['user_id', 'timestamp'])
df['time_diff'] = df.groupby('user_id')['timestamp'].diff()

df['new_session'] = df.groupby('user_id')['timestamp'].transform(lambda x: x.diff() > pd.Timedelta('30min'))
df['session_id'] = df.groupby('user_id')['new_session'].cumsum()

print("宽表:", pivot.to_dict())
print("会话数:", df['session_id'].nunique())`
  },

  {
    id: 3,
    name: 'Apriori 购物车关联分析',
    difficulty: 'basic',
    tags: ['购物篮分析', '支持度', '置信度', 'One-Hot'],
    category: '关联分析',

    background: {
      description: '找出"买了尿布是否买啤酒"等关联规则，支持捆绑销售策略。',
      origin: '关联规则挖掘源于1993年Agrawal等人提出的Apriori算法，最初应用于零售行业的购物篮分析。经典的"啤酒与尿布"案例（虽为都市传说）使其广为人知。随着电商发展，关联分析已成为推荐系统和营销策略的核心技术。',
      audience: '电商运营经理、推荐算法工程师、市场营销分析师、产品经理。',
      environment: '电商平台推荐系统、超市促销策略制定、捆绑销售方案设计。',
      problem: '业务方需要知道商品之间的关联关系，以便制定捆绑销售策略、优化商品摆放、设计交叉推荐。传统方法依赖人工经验，缺乏数据驱动的量化依据。',
      significance: '关联规则可直接转化为商业行动：高置信度规则用于交叉推荐，高提升度规则用于捆绑促销。亚马逊报告称交叉销售贡献其35%的营收。',
      industryData: '据Retail Dive报告，采用购物篮分析的零售商平均提升客单价18%；Netflix推荐系统（基于关联分析）每年节省10亿美元用户流失成本。'
    },

    tasks: [
      {
        goal: '使用 groupby(\'order_id\')[\'product_name\'].apply(list) 构建购物篮清单',
        responsible: '数据分析师',
        timeline: '第1步，预计15分钟',
        deliverable: '购物篮DataFrame，每行一个订单包含商品列表'
      },
      {
        goal: '编写循环将清单转为 One-Hot 布尔矩阵',
        responsible: '数据分析师',
        timeline: '第2步，预计20分钟',
        deliverable: '布尔矩阵DataFrame，行=订单，列=商品，值=是否购买'
      },
      {
        goal: '计算支持度（Support）与置信度（Confidence）',
        responsible: '数据分析师',
        timeline: '第3步，预计25分钟',
        deliverable: '支持度字典和置信度字典，包含所有商品对的指标'
      },
      {
        goal: '利用 Pandas merge 实现"若购买A则购买B"的规则筛选',
        responsible: '数据分析师',
        timeline: '第4步，预计20分钟',
        deliverable: 'Top5关联规则列表，包含规则表达式和置信度'
      }
    ],

    knowledge: {
      theory: '关联规则挖掘（Association Rule Mining）是数据挖掘的核心技术之一。核心概念：支持度Support(A→B) = P(AB)表示A和B同时出现的概率；置信度Confidence(A→B) = P(B|A)表示买了A的人买B的条件概率；提升度Lift(A→B) = Confidence(A→B)/P(B)衡量关联强度（>1为正相关，=1独立，<1负相关）。Apriori算法基于"频繁项集的子集也频繁"的先验性质进行剪枝。',
      practice: '在Pandas中实现关联分析的核心步骤：①按订单分组构建购物篮；②One-Hot编码生成布尔矩阵；③遍历商品对计算支持度和置信度；④设定最小阈值筛选有效规则。实际应用中常设定min_support=0.01（至少1%订单同时购买）和min_confidence=0.3（置信度至少30%）。',
      frontier: '当前前沿包括：FP-Growth算法（比Apriori快一个数量级）、基于Spark MLlib的分布式关联规则挖掘、以及结合深度学习的神经关联规则（Neural Association Rules）。Python的mlxtend库提供了完整的Apriori实现。'
    },

    concepts: {
      definitions: {
        '购物篮分析 (Market Basket Analysis)': '通过分析顾客购买的商品组合，发现商品之间的关联模式。核心输出是"如果买了A，则可能买B"的规则。',
        '支持度 (Support)': '包含商品A和B的订单数占总订单数的比例。Support(A,B) = count(A∩B) / N。衡量规则的普遍性，支持度过低的规则缺乏统计意义。',
        '置信度 (Confidence)': '在购买A的订单中同时购买B的比例。Confidence(A→B) = count(A∩B) / count(A)。衡量规则的可靠性。',
        '提升度 (Lift)': 'Confidence(A→B) / P(B)，衡量A和B的关联强度是否超越随机。Lift>1表示正相关，Lift=1表示独立，Lift<1表示互斥。',
        'One-Hot编码': '将分类变量转换为二进制向量表示。在购物篮分析中，每个商品对应一列，值为1表示购买、0表示未购买。'
      },
      relationships: '支持度衡量规则的覆盖率，置信度衡量规则的准确性，提升度衡量规则的独立价值。三者共同构成关联规则的评估体系：高支持度+高置信度+高提升度=优质规则。One-Hot编码是将原始购物篮转为可计算矩阵的必要前置步骤。'
    },

    techPoints: {
      selection: '选择手动实现而非mlxtend库，因为教学目的需要理解底层原理。使用Pandas DataFrame而非NumPy数组，因为DataFrame提供列名索引更便于业务解读。对于生产环境，推荐使用mlxtend.frequent_patterns.apriori。',
      parameters: '支持度阈值通常设为0.01-0.05（视数据量而定）；置信度阈值通常设为0.3-0.5；提升度>1.5视为强关联。商品数量>100时建议使用FP-Growth替代Apriori。',
      methods: '①groupby+apply(list)构建购物篮；②嵌套循环构建One-Hot矩阵；③双重循环遍历商品对计算指标；④sorted+lambda按置信度排序筛选Top规则。',
      risks: '风险1：商品数量大时O(n²)复杂度（应对：先过滤低频商品）；风险2：稀疏矩阵内存消耗（应对：使用scipy.sparse）；风险3：规则爆炸（应对：设定最小支持度和置信度阈值）。'
    },

    completionCriteria: {
      functional: '成功构建购物篮和One-Hot矩阵；正确计算所有商品对的支持度和置信度；输出Top5关联规则。',
      performance: '20种商品的关联分析不超过3秒；内存占用不超过50MB。',
      quality: '支持度和置信度值在[0,1]范围内；无自关联规则（A→A）；规则按置信度降序排列。',
      security: '不涉及用户隐私数据，仅使用商品级别聚合数据。',
      documentation: '代码包含支持度/置信度公式注释；输出包含规则的业务解读。',
      experience: '输出格式清晰，规则以"A→B: XX%"形式展示。'
    },

    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

# 模拟购物车数据
cart_data = {
    'order_id': [1,1,1, 2,2, 3,3,3, 4,4,4, 5,5, 6,6,6,6],
    'product': ['尿布','啤酒','薯片', '牛奶','面包', '尿布','啤酒','纸巾', '面包','牛奶','鸡蛋', '啤酒','薯片', '尿布','啤酒','牛奶','纸巾']
}
df = pd.DataFrame(cart_data)
print("购物车数据:")
print(df)
print()

# 任务1: 构建购物篮清单
basket = df.groupby('order_id')['product'].apply(list).reset_index()
basket.columns = ['order_id', 'items']
print("购物篮清单:")
print(basket)
print()

# 任务2: 构建One-Hot布尔矩阵
all_products = df['product'].unique()
print("所有商品:", all_products)
print()

one_hot = {}
for _, row in basket.iterrows():
    for prod in all_products:
        one_hot.setdefault(prod, []).append(prod in row['items'])

matrix = pd.DataFrame(one_hot)
print("One-Hot矩阵:")
print(matrix)
print()

# 任务3: 计算支持度与置信度
total_orders = len(basket)
support = {}
confidence = {}

for prod in all_products:
    support[prod] = matrix[prod].mean()
    for prod2 in all_products:
        if prod != prod2:
            both = ((matrix[prod] == True) & (matrix[prod2] == True)).sum()
            a_only = (matrix[prod] == True).sum()
            if a_only > 0:
                confidence['%s→%s' % (prod, prod2)] = both / a_only

print("支持度 (每单出现概率):")
for k, v in support.items():
    print("  %s: %.1f%%" % (k, v * 100))
print()

print("置信度 Top5规则:")
rules = sorted(confidence.items(), key=lambda x: -x[1])[:5]
for rule, conf in rules:
    print("  %s: %.1f%%" % (rule, conf * 100))
print("\\n✅ 关联分析完成!")`,

    referenceCode: `import pandas as pd
from itertools import combinations

cart_data = {
    'order_id': [1,1,1, 2,2, 3,3,3, 4,4,4, 5,5, 6,6,6,6],
    'product': ['尿布','啤酒','薯片', '牛奶','面包', '尿布','啤酒','纸巾', '面包','牛奶','鸡蛋', '啤酒','薯片', '尿布','啤酒','牛奶','纸巾']
}
df = pd.DataFrame(cart_data)

basket = df.groupby('order_id')['product'].apply(list).reset_index()
basket.columns = ['order_id', 'items']

all_products = df['product'].unique()
one_hot = {}
for _, row in basket.iterrows():
    for prod in all_products:
        one_hot.setdefault(prod, []).append(prod in row['items'])

matrix = pd.DataFrame(one_hot)
support = {prod: matrix[prod].mean() for prod in all_products}

confidence = {}
for p1 in all_products:
    for p2 in all_products:
        if p1 != p2:
            both = ((matrix[p1]) & (matrix[p2])).sum()
            if matrix[p1].sum() > 0:
                confidence['%s→%s' % (p1, p2)] = both / matrix[p1].sum()

print("最强关联:", sorted(confidence.items(), key=lambda x: -x[1])[:3])`
  },

  {
    id: 4,
    name: '销售数据的 RFM 客户价值分层',
    difficulty: 'basic',
    tags: ['RFM模型', 'qcut分箱', 'datetime', '多表关联'],
    category: '客户分析',

    background: {
      description: '计算最近消费间隔、消费频率、消费金额，将客户分为高价值/流失/普通等层级。',
      origin: 'RFM模型由Arthur Hughes在1994年提出，是客户关系管理（CRM）领域的经典方法。在《Strategic Database Marketing》一书中，Hughes证明了RFM评分能有效预测客户未来行为。如今RFM已成为电商、金融、电信等行业客户分层的标准方法。',
      audience: 'CRM经理、客户运营专家、数据分析师、市场营销人员。',
      environment: '电商客户管理、会员体系运营、精准营销投放、客户流失预警。',
      problem: '企业需要对客户进行价值分层，以便差异化运营：高价值客户需要重点维护，流失客户需要唤醒，普通客户需要培育。但如何量化客户价值、科学分层，是运营决策的核心问题。',
      significance: 'RFM模型是构建有监督学习标签的前提。通过RFM分层，企业可实现精准营销，将有限的营销资源投向最具价值的客户群体。',
      industryData: '据Salesforce报告，使用客户分层的营销活动开展率提升40%；Amazon Prime会员（高RFM客户）年均消费是非会员的2.6倍。'
    },

    tasks: [
      {
        goal: '计算 R (最近消费间隔): datetime.now() - max(date)',
        responsible: '数据分析师',
        timeline: '第1步，预计15分钟',
        deliverable: 'Recency列，单位：天'
      },
      {
        goal: '计算 F (消费频率): nunique(\'order_id\')',
        responsible: '数据分析师',
        timeline: '第2步，预计10分钟',
        deliverable: 'Frequency列，单位：次'
      },
      {
        goal: '计算 M (消费金额): sum(\'amount\')',
        responsible: '数据分析师',
        timeline: '第3步，预计10分钟',
        deliverable: 'Monetary列，单位：元'
      },
      {
        goal: '使用 pd.qcut 将 R/F/M 分别分为 4 级，拼凑出 RFM_Score',
        responsible: '数据分析师',
        timeline: '第4步，预计20分钟',
        deliverable: 'RFM评分表，包含R/F/M分数和综合分层结果'
      }
    ],

    knowledge: {
      theory: 'RFM模型是客户价值分析的三维框架：Recency（近度）衡量客户活跃度，Frequency（频度）衡量客户忠诚度，Monetary（额度）衡量客户贡献度。理论依据是"最近消费的客户更可能再次消费"（近因效应）和"高频消费的客户具有更高生命周期价值"。qcut（分位数分箱）确保每个分数段包含相同数量的客户，比cut（等距分箱）更公平。',
      practice: '标准RFM实施流程：①按客户聚合计算R/F/M原始值；②使用qcut将各维度分为4-5级（高分=好）；③R需注意方向反转（天数越小越好，所以天数小的给高分）；④综合RFM_Score = R_score + F_score + M_score；根据分数阈值划分客户层级。',
      frontier: '当前前沿包括：动态RFM（随时间自动更新评分）、RFM+（加入Interaction交互维度）、以及基于机器学习的客户价值预测（用RFM作为特征训练XGBoost模型）。Python的scikit-learn库可用于自动化RFM聚类。'
    },

    concepts: {
      definitions: {
        'RFM模型': '客户关系管理的经典分析框架，通过Recency（最近一次消费距今）、Frequency（消费频率）、Monetary（消费金额）三个维度量化客户价值。',
        'Recency (R)': '客户最近一次消费距离分析日期的天数。R越小表示客户越活跃，复购可能性越高。',
        'Frequency (F)': '客户在分析期内的消费次数。F越大表示客户忠诚度越高。',
        'Monetary (M)': '客户在分析期内的消费总额。M越大表示客户价值越高。',
        'qcut分箱': '基于分位数的等频分箱方法，将数据分为n个区间，每个区间包含大致相同数量的样本。与cut（等距分箱）不同，qcut确保样本分布均匀。',
        '客户分层': '根据客户价值指标将客户群体划分为不同层级的过程，常见的分层结果包括：高价值活跃、高价值流失预警、高频低价、低频高价、普通客户等。'
      },
      relationships: 'RFM三个维度从不同侧面描述客户价值：R反映活跃度，F反映忠诚度，M反映贡献度。三者结合可识别8种典型客户类型。qcut是RFM评分的实现工具，将连续值转为离散等级。客户分层是RFM分析的最终输出，指导差异化运营策略。'
    },

    techPoints: {
      selection: '选择Pandas groupby+agg聚合计算RFM原始值，qcut实现等频分箱。相比sklearn的KMeans聚类，RFM分箱更具业务可解释性（每个分数段有明确含义）。',
      parameters: 'qcut参数：q=4表示分为4级；labels=[4,3,2,1]指定分数值；duplicates=\'drop\'处理边界重复值。R的方向需反转（天数小→分数高）。',
      methods: '①groupby+agg多列聚合计算RFM；②qcut分箱评分；③apply+自定义函数实现客户分层规则。',
      risks: '风险1：样本量不足导致qcut分箱失败（应对：减少分箱数或增加样本）；风险2：极端值影响分箱公平性（应对：先winsorize处理异常值）；风险3：R方向混淆（应对：明确"越小越好"需要反转分数）。'
    },

    completionCriteria: {
      functional: '成功计算每个客户的R/F/M值；完成四维分箱评分；输出客户分层结果。',
      performance: '1万客户RFM计算不超过5秒；内存占用不超过100MB。',
      quality: '每个分数段客户数量大致相等（qcut特性）；R分数与Recency天数反向相关；分层结果覆盖所有客户。',
      security: '客户数据脱敏，不暴露真实客户身份。',
      documentation: '代码包含RFM计算公式注释；输出包含各层客户统计。',
      experience: '分层结果以表格形式展示，每层客户数和特征一目了然。'
    },

    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 模拟交易数据
data = {
    'customer_id': [1,1,1, 2,2, 3, 4,4,4,4, 5,5, 6, 7,7, 8,8,8],
    'order_id': ['A01','A02','A03', 'B01','B02', 'C01', 'D01','D02','D03','D04', 'E01','E02', 'F01', 'G01','G02', 'H01','H02','H03'],
    'amount': [200,150,300, 500,400, 80, 100,200,150,350, 250,180, 60, 90,120, 300,450,200],
    'date': pd.to_datetime([
        '2024-01-01','2024-03-15','2024-06-01',
        '2024-02-10','2024-04-20',
        '2023-06-15',
        '2024-05-01','2024-06-15','2024-07-20','2024-08-01',
        '2024-03-01','2024-07-15',
        '2023-08-20',
        '2024-01-10','2024-02-28',
        '2024-06-01','2024-07-01','2024-08-10'
    ])
}
df = pd.DataFrame(data)
analysis_date = datetime(2024, 9, 1)
print("交易数据:")
print(df.head(10))
print()

# 任务1: 计算RFM
rfm = df.groupby('customer_id').agg({
    'date': lambda x: (analysis_date - x.max()).days,
    'order_id': 'nunique',
    'amount': 'sum'
}).rename(columns={'date': 'Recency', 'order_id': 'Frequency', 'amount': 'Monetary'})
print("RFM计算结果:")
print(rfm)
print()

# 任务2: 使用qcut分箱 (4级)
rfm['R_score'] = pd.qcut(rfm['Recency'], 4, labels=[4,3,2,1], duplicates='drop')
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 4, labels=[1,2,3,4], duplicates='drop')
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), 4, labels=[1,2,3,4], duplicates='drop')

rfm['RFM_sum'] = rfm['R_score'].astype(int) + rfm['F_score'].astype(int) + rfm['M_score'].astype(int)
print("RFM评分:")
print(rfm[['Recency','Frequency','Monetary','R_score','F_score','M_score','RFM_sum']])
print()

# 任务3: 客户分层
def segment(row):
    if row['R_score'] >= 3 and row['F_score'] >= 3 and row['M_score'] >= 3:
        return '高价值活跃'
    elif row['R_score'] == 1:
        return '流失预警'
    elif row['F_score'] >= 3:
        return '高频用户'
    else:
        return '普通用户'

rfm['segment'] = rfm.apply(segment, axis=1)
print("客户分层结果:")
print(rfm[['Recency','Frequency','Monetary','segment']])
print("\\n✅ RFM分析完成!")`,

    referenceCode: `import pandas as pd
from datetime import datetime

data = {
    'customer_id': [1,1,1, 2,2, 3, 4,4,4,4, 5,5, 6, 7,7, 8,8,8],
    'order_id': ['A01','A02','A03', 'B01','B02', 'C01', 'D01','D02','D03','D04', 'E01','E02', 'F01', 'G01','G02', 'H01','H02','H03'],
    'amount': [200,150,300, 500,400, 80, 100,200,150,350, 250,180, 60, 90,120, 300,450,200],
    'date': pd.to_datetime([
        '2024-01-01','2024-03-15','2024-06-01',
        '2024-02-10','2024-04-20',
        '2023-06-15',
        '2024-05-01','2024-06-15','2024-07-20','2024-08-01',
        '2024-03-01','2024-07-15',
        '2023-08-20',
        '2024-01-10','2024-02-28',
        '2024-06-01','2024-07-01','2024-08-10'
    ])
}
df = pd.DataFrame(data)
analysis_date = datetime(2024, 9, 1)

rfm = df.groupby('customer_id').agg(
    Recency=('date', lambda x: (analysis_date - x.max()).days),
    Frequency=('order_id', 'nunique'),
    Monetary=('amount', 'sum')
)

rfm['R_score'] = pd.qcut(rfm['Recency'], 4, labels=[4,3,2,1], duplicates='drop')
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 4, labels=[1,2,3,4], duplicates='drop')
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), 4, labels=[1,2,3,4], duplicates='drop')

print("RFM分层完成, 客户数:", len(rfm))`
  },

  {
    id: 5,
    name: 'K-Means 聚类用户分群',
    difficulty: 'intermediate',
    tags: ['Z-Score标准化', 'K-Means', '分群解读', '数据标准化'],
    category: '聚类分析',

    background: {
      description: '对RFM特征进行Z-Score标准化，使用K-Means聚类将用户分为5个群体并分析业务特征。',
      origin: 'K-Means算法由MacQueen于1967年提出，是最经典的无监督学习聚类算法。作为"聚类"这一机器学习基础任务的代表算法，K-Means因其简单高效而被广泛应用。随着大数据时代到来，K-Means的变体（如Mini-Batch K-Means）成为处理海量数据的标准工具。',
      audience: '数据科学家、机器学习工程师、用户研究专家、商业分析师。',
      environment: '用户画像构建、市场细分、异常检测、推荐系统冷启动。',
      problem: 'RFM分箱虽然直观但过于主观（人为设定分箱边界）。需要使用无监督学习聚类客观地将用户分为多个群体，发现数据中隐藏的自然分组结构。',
      significance: '聚类分析是探索性数据分析的核心工具，可发现人工规则无法识别的用户群体。结合业务解读，聚类结果可直接指导差异化运营策略。',
      industryData: '据IBM调查，87%的数据科学项目使用聚类分析；Netflix通过用户聚类实现个性化推荐，用户留存率提升25%。'
    },

    tasks: [
      {
        goal: '使用 Pandas 对 RFM 特征进行 Z-Score 标准化 ((x-mean)/std)',
        responsible: '数据分析师',
        timeline: '第1步，预计15分钟',
        deliverable: '标准化后的特征DataFrame，各列均值为0、标准差为1'
      },
      {
        goal: '调用 sklearn.cluster.KMeans 进行聚类（n=5）',
        responsible: '数据分析师',
        timeline: '第2步，预计20分钟',
        deliverable: '每个用户的簇标签（0-4）'
      },
      {
        goal: '使用 df.groupby(\'cluster\') 统计每个簇的 RFM 均值',
        responsible: '数据分析师',
        timeline: '第3步，预计15分钟',
        deliverable: '簇特征统计表，每行一个簇的R/F/M均值'
      },
      {
        goal: '用文字描述每个簇的业务特征',
        responsible: '数据分析师',
        timeline: '第4步，预计20分钟',
        deliverable: '5个簇的业务标签（如"高价值活跃"、"低价值沉睡"）'
      }
    ],

    knowledge: {
      theory: 'K-Means是一种基于距离的划分聚类算法。核心思想：随机选择K个中心点；②将每个样本分配给最近的中心点；③重新计算每个簇的中心（取均值）；④重复②③直到中心不再变化。目标函数是最小化簇内平方和（WCSS）。Z-Score标准化公式：z = (x - μ) / σ，将数据转换为均值为0、标准差为1的标准正态分布，消除量纲影响。',
      practice: 'K-Means实施流程：①数据标准化（必需，否则数值大的特征主导距离）；②选择K值（肘部法则/轮廓系数）；③运行K-Means获取标签；④按簇分组统计特征均值；⑤结合业务知识给每个簇打标签。关键注意事项：K-Means对初始中心敏感，需设置random_state保证可复现。',
      frontier: '当前前沿包括：DBSCAN（密度聚类，自动确定簇数）、HDBSCAN（层次密度聚类）、谱聚类（Spectral Clustering）、以及深度聚类（Deep Clustering，结合神经网络）。Python的scikit-learn提供完整的聚类算法库。'
    },

    concepts: {
      definitions: {
        '聚类分析 (Cluster Analysis)': '无监督学习方法，将相似的数据点分组到同一簇中，使簇内差异最小化、簇间差异最大化。',
        'K-Means': '最常用的聚类算法，将数据分为K个簇，通过迭代优化簇中心位置。K值需预先指定。',
        'Z-Score标准化': '将原始数据转换为标准正态分布的预处理方法。公式：z = (x - mean) / std。标准化后数据均值为0，标准差为1。',
        '肘部法则 (Elbow Method)': '通过绘制不同K值对应的WCSS曲线，选择曲线拐点（肘部）作为最优K值。',
        '簇内平方和 (WCSS)': 'Within-Cluster Sum of Squares，衡量聚类质量的核心指标。WCSS越小表示簇内越紧密。',
        '业务解读': '将算法输出的簇标签转化为业务人员可理解的描述，如"高价值活跃用户"。需要结合簇的特征均值和业务经验。'
      },
      relationships: '标准化是聚类的前置必要步骤（消除量纲影响）；K-Means是聚类的核心算法（分组）；WCSS是聚类质量的评估指标；业务解读是聚类结果的价值实现（将技术输出转化为商业洞察）。四者构成"预处理→算法→评估→应用"的完整链条。'
    },

    techPoints: {
      selection: '手动实现K-Means核心逻辑（教学目的），生产环境推荐使用sklearn.cluster.KMeans。选择Z-Score而非Min-Max标准化，因为K-Means基于欧氏距离，Z-Score更适合距离计算。',
      parameters: 'K值选择：业务场景通常5-8个簇；max_iter：默认300次迭代；n_init：多次运行取最优（默认10）；random_state：固定随机种子保证可复现。',
      methods: '①(Z - mean) / std实现Z-Score标准化；②手动实现K-Means迭代（距离计算+标签分配+中心更新）；③groupby+mean统计簇特征；④基于特征均值组合进行业务标签映射。',
      risks: '风险1：K值选择不当导致过拟合或欠拟合（应对：肘部法则/轮廓系数辅助）；风险2：局部最优（应对：多次初始化取最优）；风险3：对异常值敏感（应对：先做异常值处理）。'
    },

    completionCriteria: {
      functional: '成功完成Z-Score标准化；K-Means聚类输出5个簇；每个簇有明确的业务标签。',
      performance: '20个用户聚类不超过2秒；算法在100次迭代内收敛。',
      quality: '标准化后各列均值≈0、标准差≈1；每个簇至少包含1个样本；簇标签覆盖0-4。',
      security: '聚类结果不包含可识别个人信息。',
      documentation: '代码包含K-Means算法步骤注释；输出包含每个簇的特征描述。',
      experience: '簇业务标签清晰易懂，非技术人员也能理解。'
    },

    initialCode: `import pandas as pd
import numpy as np

# 模拟RFM特征数据
np.random.seed(42)
n_users = 20
data = {
    'user_id': range(1, n_users + 1),
    'Recency': np.random.randint(1, 120, n_users),
    'Frequency': np.random.randint(1, 30, n_users),
    'Monetary': np.random.randint(50, 5000, n_users)
}
df = pd.DataFrame(data)
print("原始RFM数据:")
print(df.head(10))
print()

# 任务1: Z-Score标准化
features = ['Recency', 'Frequency', 'Monetary']
for f in features:
    df['%s_z' % f] = (df[f] - df[f].mean()) / df[f].std()

print("标准化后:")
print(df[['user_id'] + ['%s_z' % f for f in features]].head(10))
print()

# 任务2: 手动实现K-Means (5个簇)
from numpy.linalg import norm

def kmeans(X, k, max_iter=100):
    np.random.seed(42)
    centers = X[np.random.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        distances = np.array([[norm(x - c) for c in centers] for x in X])
        labels = np.argmin(distances, axis=1)
        new_centers = np.array([X[labels == i].mean(axis=0) for i in range(k)])
        if np.allclose(centers, new_centers):
            break
        centers = new_centers
    return labels, centers

X = df[['Recency_z', 'Frequency_z', 'Monetary_z']].values
labels, centers = kmeans(X, 5)
df['cluster'] = labels

print("聚类结果 - 各簇大小:")
print(df['cluster'].value_counts().sort_index())
print()

# 任务3: 分析每个簇的业务特征
cluster_stats = df.groupby('cluster')[features].mean()
print("各簇特征均值:")
print(cluster_stats)
print()

cluster_labels = {
    0: '高价值活跃用户',
    1: '低价值沉睡用户',
    2: '中价值稳定用户',
    3: '高价值流失预警',
    4: '新晋潜力用户'
}

for c in range(5):
    cnt = (df['cluster'] == c).sum()
    r, f, m = cluster_stats.loc[c]
    print("簇%d (%s): %d人 | R=%.0f天 F=%.1f次 M=$%.0f" % (c, cluster_labels[c], cnt, r, f, m))

print("\\n✅ 聚类分析完成!")`,

    referenceCode: `import pandas as pd
import numpy as np

np.random.seed(42)
n = 20
df = pd.DataFrame({
    'user_id': range(1, n + 1),
    'Recency': np.random.randint(1, 120, n),
    'Frequency': np.random.randint(1, 30, n),
    'Monetary': np.random.randint(50, 5000, n)
})

for f in ['Recency', 'Frequency', 'Monetary']:
    df['%s_z' % f] = (df[f] - df[f].mean()) / df[f].std()

def kmeans(X, k, max_iter=100):
    np.random.seed(42)
    centers = X[np.random.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        distances = np.array([[np.sqrt(((x-c)**2).sum()) for c in centers] for x in X])
        labels = np.argmin(distances, axis=1)
        centers = np.array([X[labels == i].mean(axis=0) for i in range(k)])
    return labels

X = df[['Recency_z', 'Frequency_z', 'Monetary_z']].values
df['cluster'] = kmeans(X, 5)

print("聚类完成, 各簇人数:", df['cluster'].value_counts().to_dict())`
  },

  {
    id: 6,
    name: '时间序列异常值检测',
    difficulty: 'intermediate',
    tags: ['resample', 'rolling窗口', '异常检测', '时间序列'],
    category: '异常检测',

    background: {
      description: '按小时汇总订单额，计算滚动均值与标准差，找出GMV突刺或断崖的异常时间点。',
      origin: '时间序列异常检测是监控系统的核心功能。随着实时数据分析的普及，企业需要即时发现业务指标异常。Gartner将AIOps（AI驱动的运维）列为战略技术趋势，异常检测是AIOps的核心能力之一。',
      audience: '数据分析师、运维工程师、业务监控负责人、算法工程师。',
      environment: '电商GMV监控、服务器指标告警、金融交易风控、IoT设备状态监测。',
      problem: 'AI告警系统发现昨日GMV暴跌。需要快速定位是哪个小时、哪个品类出了问题，判断是"突刺"（暴涨）还是"断崖"（暴跌），为根因分析提供时间线索。',
      significance: '异常检测是业务监控的最后一道防线。及时发现异常可避免重大损失：电商GMV断崖可能意味着系统故障，金融交易突刺可能意味着欺诈行为。',
      industryData: '据PagerDuty报告，平均每个企业每月经历154次业务中断；亚马逊每100ms延迟导致1%销售损失；Netflix通过异常检测将故障响应时间从30分钟降至2分钟。'
    },

    tasks: [
      {
        goal: '使用 resample(\'H\') 按小时汇总订单额',
        responsible: '数据分析师',
        timeline: '第1步，预计10分钟',
        deliverable: '按小时聚合的GMV时间序列'
      },
      {
        goal: '使用 rolling(window=24) 计算移动平均值与标准差',
        responsible: '数据分析师',
        timeline: '第2步，预计15分钟',
        deliverable: '滚动均值和滚动标准差时间序列'
      },
      {
        goal: '自定义函数找出 (实际值 < 均值 - 2*标准差) 的异常时间点',
        responsible: '数据分析师',
        timeline: '第3步，预计20分钟',
        deliverable: '异常时间点列表，包含时间、实际值、偏离度、异常类型'
      },
      {
        goal: '标注异常为"突刺"或"断崖"',
        responsible: '数据分析师',
        timeline: '第4步，预计10分钟',
        deliverable: '带异常类型标注的完整报告'
      }
    ],

    knowledge: {
      theory: '时间序列异常检测基于统计假设：正常数据围绕均值波动，超出μ±2σ（95%置信区间）的点视为异常。滚动窗口（Rolling Window）是时间序列分析的核心技术，在滑动的时间窗口内计算统计量，捕捉数据的动态变化模式。2σ原则源于正态分布的3σ法则：68%数据在μ±1σ内，95%在μ±2σ内，99.7%在μ±3σ内。',
      practice: '标准异常检测流程：①resample按固定频率聚合原始数据；②rolling计算移动均值和标准差；③定义异常阈值（常用μ±2σ或μ±3σ）；④标记超出阈值的点；⑤根据偏离方向分类（突刺=高于上限，断崖=低于下限）。关键注意点：min_periods控制窗口起始阶段的有效数据量。',
      frontier: '当前前沿包括：孤立森林（Isolation Forest，基于密度的异常检测）、LSTM自编码器（深度学习异常检测）、Prophet异常检测（Facebook时间序列库）、以及在线异常检测（流式实时处理）。Python的scikit-learn和PyOD库提供丰富的异常检测算法。'
    },

    concepts: {
      definitions: {
        '时间序列 (Time Series)': '按时间顺序排列的数据点序列，每个数据点与特定时间戳关联。具有趋势性、季节性和随机性三大特征。',
        '重采样 (Resample)': '将时间序列数据按新频率重新聚合的操作。如将分钟级数据聚合为小时级（resample(\'H\')）或天级（resample(\'D\')）。',
        '滚动窗口 (Rolling Window)': '在时间序列上滑动的固定大小窗口，在每个窗口位置计算统计量（均值、标准差等）。用于捕捉数据的局部特征和动态变化。',
        '2σ原则': '正态分布下，约95%的数据落在均值±2倍标准差范围内。超出此范围的点有统计意义上的异常嫌疑。',
        '突刺 (Spike)': '数据值显著高于正常范围的异常点，通常由流量激增、系统故障或欺诈行为引起。',
        '断崖 (Drop/Cliff)': '数据值显著低于正常范围的异常点，通常由系统宕机、业务中断或数据缺失引起。'
      },
      relationships: 'resample是数据频率转换操作，为后续分析准备合适粒度的数据；rolling是基于重采样后数据的窗口统计计算；2σ原则是异常判定的统计依据；突刺和断崖是异常的两种基本类型（方向不同）。四者构成"降采样→窗口统计→异常判定→分类标注"的完整分析链。'
    },

    techPoints: {
      selection: '选择Pandas resample+rolling组合，因为这是时间序列分析的标准工具链。相比专用异常检测库，Pandas方案更轻量、更易理解，适合教学和中小数据量场景。',
      parameters: 'resample参数：\'H\'=小时，\'D\'=天，\'W\'=周，\'M\'=月。rolling参数：window=24（24小时窗口），min_periods=1（窗口起始阶段至少1个有效值）。异常阈值：2*std（95%置信）或3*std（99.7%置信）。',
      methods: '①resample(\'H\').sum()按小时聚合；②rolling(window=24).mean()/std()计算滚动统计量；③逐点比较判定异常；④根据val与mean的大小关系分类突刺/断崖。',
      risks: '风险1：窗口大小选择不当（应对：根据业务周期选择，如24小时捕捉日模式）；风险2：季节性数据误报（应对：先做季节性分解）；风险3：滚动窗口起始阶段数据不足（应对：设置min_periods）。'
    },

    completionCriteria: {
      functional: '成功按小时聚合GMV；计算24小时滚动均值和标准差；正确识别异常点并分类。',
      performance: '48小时数据异常检测不超过3秒；内存占用不超过30MB。',
      quality: '异常点判定符合2σ原则；突刺/断崖分类正确；无漏报关键异常。',
      security: '不涉及敏感业务数据。',
      documentation: '代码包含2σ原则说明；输出格式清晰的异常报告。',
      experience: '异常报告包含时间、类型、偏离度等完整信息。'
    },

    initialCode: `import pandas as pd
import numpy as np

# 模拟24小时GMV数据 (含异常)
np.random.seed(42)
hours = pd.date_range('2024-01-01', periods=48, freq='h')
gmv = np.random.normal(1000, 200, 48)
gmv[12] = 200   # 断崖: 午间暴跌
gmv[13] = 150   # 持续异常
gmv[30] = 2500  # 突刺: 凌晨暴涨
gmv[31] = 2800  # 持续突刺

df = pd.DataFrame({'hour': hours, 'gmv': gmv})
df = df.set_index('hour')
print("原始数据:")
print(df.head(15))
print()

# 任务1: 按小时汇总 (已按小时,模拟展示)
hourly = df['gmv'].resample('H').sum()

# 任务2: 计算24小时滚动均值与标准差
rolling_mean = hourly.rolling(window=24, min_periods=1).mean()
rolling_std = hourly.rolling(window=24, min_periods=1).std().fillna(0)

# 任务3: 检测异常点
anomalies = []
for idx in df.index:
    val = hourly.loc[idx]
    mean = rolling_mean.loc[idx]
    std = rolling_std.loc[idx]

    if std > 0:
        if val < mean - 2 * std:
            anomalies.append({
                'time': idx,
                'value': val,
                'type': '断崖',
                'diff': "%.0f" % (val - mean)
            })
        elif val > mean + 2 * std:
            anomalies.append({
                'time': idx,
                'value': val,
                'type': '突刺',
                'diff': "+%.0f" % (val - mean)
            })

print("=" * 50)
print("⚠️  异常检测报告")
print("=" * 50)
for a in anomalies:
    print("[%s] %s | GMV: $%.0f | 偏离: %s" % (a['type'], a['time'], a['value'], a['diff']))

print("\\n共发现 %d 个异常时间点" % len(anomalies))
print("✅ 异常检测完成!")`,

    referenceCode: `import pandas as pd
import numpy as np

np.random.seed(42)
hours = pd.date_range('2024-01-01', periods=48, freq='h')
gmv = np.random.normal(1000, 200, 48)
gmv[12] = 200
gmv[13] = 150
gmv[30] = 2500
gmv[31] = 2800

df = pd.DataFrame({'gmv': gmv}, index=hours)

rolling_mean = df['gmv'].rolling(window=24, min_periods=1).mean()
rolling_std = df['gmv'].rolling(window=24, min_periods=1).std().fillna(0)

anomalies = []
for idx in df.index:
    val, mean, std = df.loc[idx, 'gmv'], rolling_mean.loc[idx], rolling_std.loc[idx]
    if std > 0:
        if val < mean - 2 * std:
            anomalies.append({'time': idx, 'type': '断崖', 'value': val})
        elif val > mean + 2 * std:
            anomalies.append({'time': idx, 'type': '突刺', 'value': val})

print("发现 %d 个异常点" % len(anomalies))
for a in anomalies:
    print("[%s] %s GMV: $%.0f" % (a['type'], a['time'], a['value']))`
  },

  {
    id: 7,
    name: '多源数据融合归因分析',
    difficulty: 'intermediate',
    tags: ['merge_asof', '归因模型', 'crosstab', 'ROI'],
    category: '归因分析',

    background: {
      description: '使用merge_asof将点击流与订单数据做非精确匹配，计算最后一次点击归因模型和各渠道ROI。',
      origin: '营销归因（Marketing Attribution）是数字营销领域的核心问题。随着多触点营销的发展，用户转化路径越来越复杂。IAB（互动广告局）2023年报告指出，平均用户转化前会接触6-8个广告触点。如何公平分配各触点的转化贡献，是营销预算优化的关键。',
      audience: '营销分析师、增长黑客、广告优化师、数据产品经理。',
      environment: '数字营销效果评估、广告渠道ROI分析、营销预算分配优化。',
      problem: 'AI营销系统记录了广告点击，电商记录了订单。如何将两者关联，计算转化归因（最后一次点击归因模型），并评估各渠道的投入产出比（ROI）？',
      significance: '归因分析直接指导营销预算分配。准确的归因模型可使营销ROI提升20%-40%，避免将预算浪费在低效渠道上。',
      industryData: '据eMarketer报告，2024年全球数字广告支出达6850亿美元；采用多触点归因的企业营销效率提升35%；Google Ads数据显示，最后一次点击归因是最常用的归因模型（占比62%）。'
    },

    tasks: [
      {
        goal: '使用 merge_asof 根据时间戳将点击流与订单数据做非精确匹配',
        responsible: '数据分析师',
        timeline: '第1步，预计25分钟',
        deliverable: '归因关联表，每个订单关联到最近的点击记录'
      },
      {
        goal: '处理一对多关系：一个订单只归因给点击流中最近的那一条',
        responsible: '数据分析师',
        timeline: '第2步，预计15分钟',
        deliverable: '唯一归因结果，每个订单对应一个渠道'
      },
      {
        goal: '使用 crosstab 生成渠道转化漏斗表',
        responsible: '数据分析师',
        timeline: '第3步，预计15分钟',
        deliverable: '渠道×用户的转化交叉表'
      },
      {
        goal: '计算各渠道 ROI = (revenue - cost) / cost',
        responsible: '数据分析师',
        timeline: '第4步，预计15分钟',
        deliverable: '渠道ROI报告，包含订单数、收入、成本、ROI'
      }
    ],

    knowledge: {
      theory: '营销归因（Attribution Modeling）是将转化成果分配给营销触点的分析框架。常见模型：最后一次点击归因（Last Click，100%归因给最后触点）、第一次点击归因（First Click）、线性归因（Linear，各触点均分）、时间衰减归因（Time Decay，越近权重越高）、位置归因（Position Based，首尾各40%中间20%均分）。merge_asof是Pandas实现时间非精确匹配的核心方法。',
      practice: '归因分析实施流程：①确保两表按时间排序（merge_asof的前提）；②使用merge_asof进行非精确时间匹配（direction=\'backward\'取订单前最近的点击）；③按渠道分组统计订单数和收入；④结合广告成本计算ROI；⑤用crosstab生成转化漏斗。关键注意点：merge_asof要求关联列必须排序。',
      frontier: '当前前沿包括：数据驱动归因（Data-Driven Attribution，基于马尔可夫链）、MTA（多触点归因）平台、以及隐私保护归因（Apple ATT框架下的归因方案）。Google Analytics 4默认使用数据驱动归因模型。'
    },

    concepts: {
      definitions: {
        '营销归因 (Marketing Attribution)': '将转化成果（如订单、注册）分配给营销触点的分析过程。解决"哪个渠道/广告促成了转化"的问题。',
        '最后一次点击归因 (Last Click Attribution)': '最简单的归因模型，将100%转化功劳归因给用户转化前最后一次接触的营销触点。虽不完美但因简单透明而被广泛使用。',
        'merge_asof': 'Pandas的非精确时间连接方法，类似SQL的ASOF JOIN。按时间匹配两表，取左表时间点之前（或之后）最近的右表记录。要求连接列必须排序。',
        'ROI (Return on Investment)': '投资回报率，计算公式：(收益 - 成本) / 成本。ROI > 0表示盈利，ROI < 0表示亏损。',
        '转化漏斗 (Conversion Funnel)': '描述用户从接触到转化各阶段流失情况的分析模型。在归因分析中体现为各渠道的曝光→点击→转化转化率。'
      },
      relationships: 'merge_asof是实现最后一次点击归因的技术工具；ROI是评估归因结果的业务指标；crosstab是展示多渠道转化对比的分析方法。三者分别解决"如何关联"、"如何评估"、"如何展示"的问题。'
    },

    techPoints: {
      selection: '选择merge_asof而非merge，因为点击和订单时间不可能精确匹配。merge_asof的backward方向正好对应"取订单前最近点击"的业务逻辑。',
      parameters: 'merge_asof关键参数：left_on/right_on（时间列）、on（连接键）、direction（backward/forward/nearest）、allow_exact_matches（是否允许精确匹配）。',
      methods: '两表分别按时间排序；②merge_asof非精确匹配；③groupby渠道聚合统计；④计算ROI = (revenue-cost)/cost；⑤crosstab生成渠道转化矩阵。',
      risks: '风险1：未排序导致merge_asof报错（应对：merge前必须sort_values）；风险2：无点击记录的订单无法归因（应对：left join保留所有订单）；风险3：多次点击归因偏差（应对：考虑多触点归因模型）。'
    },

    completionCriteria: {
      functional: '成功使用merge_asof关联点击和订单数据；正确计算各渠道ROI；生成渠道转化漏斗表。',
      performance: '1000条点击+100条订单的关联不超过3秒。',
      quality: '每个订单最多归因一个渠道；ROI计算准确；无归因遗漏。',
      security: '广告成本和用户数据脱敏处理。',
      documentation: '代码包含归因模型说明；输出包含渠道对比分析。',
      experience: 'ROI结果按渠道清晰展示，便于业务决策。'
    },

    initialCode: `import pandas as pd
import numpy as np

# 模拟广告点击流数据
clicks = pd.DataFrame({
    'user_id': [1,1,2,2,2,3,4,4,5],
    'click_time': pd.to_datetime([
        '2024-01-10 09:00', '2024-01-10 10:30',
        '2024-01-10 11:00', '2024-01-10 12:00', '2024-01-10 14:00',
        '2024-01-11 08:00',
        '2024-01-11 10:00', '2024-01-11 11:00',
        '2024-01-12 09:00'
    ]),
    'channel': ['google', 'facebook', 'google', 'tiktok', 'tiktok', 'baidu', 'google', 'facebook', 'tiktok'],
    'cost': [2.5, 3.0, 1.8, 4.5, 3.2, 2.0, 2.5, 3.0, 4.0]
})

# 模拟订单数据
orders = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'order_time': pd.to_datetime([
        '2024-01-10 11:00', '2024-01-10 15:00',
        '2024-01-11 09:30', '2024-01-11 12:00',
        '2024-01-12 10:00'
    ]),
    'amount': [500, 800, 300, 650, 1200]
})

print("点击流数据:")
print(clicks)
print()
print("订单数据:")
print(orders)
print()

# 任务1: merge_asof 非精确匹配
clicks_sorted = clicks.sort_values('click_time')
orders_sorted = orders.sort_values('order_time')

attribution = pd.merge_asof(
    orders_sorted,
    clicks_sorted,
    on='user_id',
    left_on='order_time',
    right_on='click_time',
    direction='backward'
)

print("归因结果 (最后一次点击):")
print(attribution[['user_id', 'order_time', 'amount', 'channel', 'cost']])
print()

# 任务2: 渠道转化统计
channel_stats = attribution.groupby('channel').agg(
    orders=('user_id', 'count'),
    revenue=('amount', 'sum'),
    cost=('cost', 'sum')
)
channel_stats['roi'] = (channel_stats['revenue'] - channel_stats['cost']) / channel_stats['cost']

print("渠道ROI:")
print(channel_stats)
print()

# 任务3: 渠道转化漏斗
funnel = pd.crosstab(attribution['channel'], attribution['user_id'], aggfunc='count')
print("渠道-用户转化矩阵:")
print(funnel)
print("\\n✅ 归因分析完成!")`,

    referenceCode: `import pandas as pd

clicks = pd.DataFrame({
    'user_id': [1,1,2,2,2,3,4,4,5],
    'click_time': pd.to_datetime([
        '2024-01-10 09:00', '2024-01-10 10:30',
        '2024-01-10 11:00', '2024-01-10 12:00', '2024-01-10 14:00',
        '2024-01-11 08:00',
        '2024-01-11 10:00', '2024-01-11 11:00',
        '2024-01-12 09:00'
    ]),
    'channel': ['google', 'facebook', 'google', 'tiktok', 'tiktok', 'baidu', 'google', 'facebook', 'tiktok'],
    'cost': [2.5, 3.0, 1.8, 4.5, 3.2, 2.0, 2.5, 3.0, 4.0]
})

orders = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'order_time': pd.to_datetime([
        '2024-01-10 11:00', '2024-01-10 15:00',
        '2024-01-11 09:30', '2024-01-11 12:00',
        '2024-01-12 10:00'
    ]),
    'amount': [500, 800, 300, 650, 1200]
})

attribution = pd.merge_asof(
    orders.sort_values('order_time'),
    clicks.sort_values('click_time'),
    left_on='order_time',
    right_on='click_time',
    by='user_id',
    direction='backward'
)

channel_stats = attribution.groupby('channel').agg(orders=('user_id', 'count'), revenue=('amount', 'sum'), cost=('cost', 'sum'))
channel_stats['roi'] = (channel_stats['revenue'] - channel_stats['cost']) / channel_stats['cost']

print("渠道ROI:", channel_stats['roi'].to_dict())`
  },

  {
    id: 8,
    name: '文本评论情感极性清洗与分词',
    difficulty: 'basic',
    tags: ['正则表达式', 'str方法', 'explode', '停用词过滤'],
    category: '文本处理',

    background: {
      description: '清洗评论中的HTML标签和表情符号，分词处理，为NLP情感分析模型准备训练数据。',
      origin: '随着UGC（用户生成内容）的爆炸式增长，文本情感分析成为理解用户态度的核心手段。据Statista报告，2024年全球每天有超过5亿条评论产生。Amazon、淘宝等电商平台依赖评论情感分析指导产品改进和运营决策。',
      audience: 'NLP工程师、数据分析师、产品经理、用户研究员。',
      environment: '电商评论分析、社交媒体舆情监控、客服工单分类、产品反馈挖掘。',
      problem: '为NLP情感分析模型准备训练数据，AI模型要求输入必须是干净的词列表。原始评论包含HTML标签、表情符号、特殊字符等噪声，需要系统清洗。',
      significance: '数据质量直接决定NLP模型效果。GIGO原则（Garbage In, Garbage Out）在NLP中尤为突出：脏数据训练的模型无法准确判断情感极性。',
      industryData: '据Gartner，70%的客户购买决策受在线评论影响；Amazon评论分析帮助卖家提升产品评分0.3-0.5星；微博情感分析在舆情监控中准确率达85%。'
    },

    tasks: [
      {
        goal: '使用 Pandas 的 str 方法去除评论中的 HTML 标签、表情符号',
        responsible: '数据分析师',
        timeline: '第1步，预计20分钟',
        deliverable: '清洗后的纯文本评论'
      },
      {
        goal: '将评论文本按空格切分为词列表（str.split()）',
        responsible: '数据分析师',
        timeline: '第2步，预计15分钟',
        deliverable: '每条评论对应的词列表'
      },
      {
        goal: '将列表列的 NaN 填充为空列表[]，防止 AI 模型报错',
        responsible: '数据分析师',
        timeline: '第3步，预计10分钟',
        deliverable: '无NaN的词列表列'
      },
      {
        goal: '停用词过滤，移除无意义高频词',
        responsible: '数据分析师',
        timeline: '第4步，预计15分钟',
        deliverable: '过滤后的有效词列表'
      }
    ],

    knowledge: {
      theory: '文本预处理（Text Preprocessing）是NLP流水线的第一步，包括清洗、分词、去停用词、词干化等步骤。正则表达式是文本清洗的核心工具，可匹配和替换任意模式的字符串。停用词（Stop Words）是在文本中高频出现但对语义贡献小的词（如"的"、"了"），在情感分析中通常需要过滤。',
      practice: '标准文本清洗流程：①用re.sub去除HTML标签（<[^>]+>）；②去除表情符号和特殊字符（保留中英文和标点）；③按空格或字符切分（中文无空格需特殊处理）；④过滤停用词；⑤处理空值和NaN。中文分词通常使用jieba库，本项目简化为按字符切分。',
      frontier: '当前前沿包括：BERT等预训练模型（无需显式分词）、SentencePiece（子词切分）、以及多语言统一预处理管道。Hugging Face Transformers库提供了完整的NLP预处理工具链。'
    },

    concepts: {
      definitions: {
        '文本清洗 (Text Cleaning)': '去除文本中的噪声（HTML标签、特殊字符、多余空白等），保留有意义的语言内容。',
        'HTML标签': '网页中用尖括号包裹的标记（如<p>、<div>），在评论数据中常见但无文本分析价值。',
        '停用词 (Stop Words)': '文本中出现频率高但对语义区分度低的词。中文常见停用词："的"、"了"、"是"、"在"等。过滤停用词可减少特征维度、提高模型效率。',
        '分词 (Tokenization)': '将连续文本切分为独立词语单元的过程。英文以空格自然分词，中文需要专门的分词算法（如jieba）。',
        '情感极性 (Sentiment Polarity)': '文本表达的情感倾向，分为正面（Positive）、负面（Negative）和中性（Neutral）。'
      },
      relationships: 'HTML标签和表情符号是文本噪声的来源；正则表达式是清洗噪声的工具；分词是将清洗后的文本转为结构化数据的方法；停用词过滤是进一步提炼有效特征的手段。四者形成"去噪→结构化→提炼"的文本预处理管道。'
    },

    techPoints: {
      selection: '选择Pandas str方法 + re模块进行清洗，而非BeautifulSoup，因为评论中的HTML通常不完整且str方法更轻量。中文分词简化为按字符切分（生产环境应使用jieba）。',
      parameters: "re.sub(pattern, repl, string)：pattern匹配HTML标签；pattern匹配非单词非空白字符。fillna([])处理空列表。",
      methods: '①re.sub清洗HTML和特殊字符；②apply(list)按字符分词；③列表推导式过滤停用词；④fillna+lambda处理NaN。',
      risks: '风险1：正则过度清洗丢失有用信息（应对：保留中文标点）；风险2：NaN处理不当导致模型报错（应对：填充空列表）；风险3：按字符分词丢失词语边界（应对：生产环境使用jieba）。'
    },

    completionCriteria: {
      functional: '成功去除HTML标签和表情；完成分词和停用词过滤；无NaN值。',
      performance: '1000条评论清洗不超过5秒。',
      quality: '清洗后无HTML标签残留；停用词已移除；空评论处理为[]而非NaN。',
      security: '评论内容脱敏，不暴露用户身份。',
      documentation: '代码包含正则表达式注释；输出展示清洗前后对比。',
      experience: '词列表格式清晰，便于后续NLP处理。'
    },

    initialCode: `import pandas as pd
import re
import numpy as np

# 模拟评论数据 (含HTML标签和表情)
data = {
    'review_id': [1, 2, 3, 4, 5, 6],
    'user': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
    'comment': [
        '<p>这产品太棒了!</p> \\xf0\\x9f\\x98\\x8d 强烈推荐',
        '质量一般般... 不太满意 \\xf0\\x9f\\x98\\x95',
        '<div><span>物流超快</span></div> \\xf0\\x9f\\x91\\x8d 包装精美',
        '非常失望! 商品和图片完全不同 \\xf0\\x9f\\x98\\xa1\\xf0\\x9f\\x92\\xa2',
        '<br>还行吧，价格实惠',
        np.nan
    ]
}
df = pd.DataFrame(data)
print("原始评论数据:")
print(df)
print()

# 任务1: 清洗HTML标签和表情
def clean_text(text):
    if pd.isna(text):
        return ''
    text = re.sub(r'<[^>]+>', '', str(text))
    text = re.sub(r'[^\\w\\s，。！？、；：""\'\'（）【】《》]', '', text)
    return text.strip()

df['clean_comment'] = df['comment'].apply(clean_text)
print("清洗后:")
print(df[['user', 'clean_comment']])
print()

# 任务2: 分词
df['words'] = df['clean_comment'].apply(
    lambda x: list(x) if x else []
)
print("分词结果:")
print(df[['user', 'words']])
print()

# 任务3: 停用词过滤
stop_words = {'的', '了', '吧', '是', '太', '非常', '很', '这', '那', '都', '也', '还'}
df['filtered_words'] = df['words'].apply(
    lambda words: [w for w in words if w not in stop_words]
)

df['filtered_words'] = df['filtered_words'].apply(lambda x: x if x else [])
print("停用词过滤后:")
for _, row in df.iterrows():
    print("%s: %s" % (row['user'], row['filtered_words']))
print()

# 任务4: 词频统计
all_words = [w for words in df['filtered_words'] for w in words]
word_freq = pd.Series(all_words).value_counts().head(10)
print("Top 10 高频词:")
print(word_freq)
print("\\n✅ 文本清洗与分词完成!")`,

    referenceCode: `import pandas as pd
import re
import numpy as np

data = {
    'review_id': [1, 2, 3, 4, 5, 6],
    'comment': [
        '<p>这产品太棒了!</p> 强烈推荐',
        '质量一般般... 不太满意',
        '<div><span>物流超快</span></div> 包装精美',
        '非常失望! 商品和图片完全不同',
        '<br>还行吧，价格实惠',
        None
    ]
}
df = pd.DataFrame(data)

def clean_text(text):
    if pd.isna(text):
        return ''
    text = re.sub(r'<[^>]+>', '', str(text))
    # 保留中文、英文、数字和常见中文标点
    text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：\"\"（）【】《》]', '', text)
    return text.strip()

df['clean'] = df['comment'].apply(clean_text)
df['words'] = df['clean'].apply(lambda x: list(x) if x else [])

stop_words = {'的', '了', '吧', '是', '太', '很'}
df['filtered'] = df['words'].apply(lambda w: [x for x in w if x not in stop_words])

print("分词完成, 有效评论数:", (df['clean'] != '').sum())`
  },

  {
    id: 9,
    name: '帕累托分析商品贡献度',
    difficulty: 'basic',
    tags: ['groupby', 'cumsum', '帕累托', 'pd.cut分箱'],
    category: '贡献度分析',

    background: {
      description: '找出前20%贡献80%流水的商品，将商品分类为爆款、腰部、长尾。',
      origin: '帕累托法则（80/20法则）由意大利经济学家维尔弗雷多·帕累托于1906年提出，最初用于描述财富分布（20%的人拥有80%的财富）。1940年代，质量管理专家约瑟夫·朱兰将其引入商业领域，发现80%的质量问题来自20%的原因。如今帕累托分析是产品管理和库存优化的标准工具。',
      audience: '产品经理、品类运营、供应链分析师、数据分析师。',
      environment: '电商品类管理、库存优化、爆款打造、长尾商品策略。',
      problem: '管理层要求聚焦前20%贡献80%流水的商品。需要计算单品销售额、累计占比，根据阈值将商品分类为"爆款"、"腰部"、"长尾"。',
      significance: '帕累托分析指导资源聚焦：爆款需要重点维护和扩量，腰部商品有提升潜力，长尾商品考虑优化或淘汰。直接指导SKU管理和采购决策。',
      industryData: '据麦肯锡报告，优化商品结构可使电商毛利率提升3-5个百分点；Amazon的长尾商品占总SKU的80%但仅贡献10%销售额；Zara通过帕累托分析将爆款比例控制在15%以内。'
    },

    tasks: [
      {
        goal: '计算单品销售额 groupby(\'product\')[\'amount\'].sum()',
        responsible: '数据分析师',
        timeline: '第1步，预计10分钟',
        deliverable: '各商品销售额汇总'
      },
      {
        goal: '降序排列后计算累计占比：cumsum() / total',
        responsible: '数据分析师',
        timeline: '第2步，预计15分钟',
        deliverable: '累计销售额和累计占比列'
      },
      {
        goal: '根据累计占比阈值（<80%）将商品分类',
        responsible: '数据分析师',
        timeline: '第3步，预计15分钟',
        deliverable: '带分类标签的商品贡献度报告'
      }
    ],

    knowledge: {
      theory: '帕累托分析（Pareto Analysis）基于80/20法则，识别"关键的少数"。核心计算：按贡献降序排列→计算累计占比→找到80%分界点。cumsum()（累计求和）是实现帕累托分析的核心方法，将单个值转为累积值。',
      practice: '标准帕累托分析流程：①groupby按商品聚合销售额；②sort_values降序排列；③cumsum计算累计销售额；④累计/总计得到累计占比；⑤根据阈值分类（<80%爆款，80-95%腰部，>95%长尾）。',
      frontier: '当前前沿包括：多维帕累托分析（同时考虑销售额+利润率+增长率）、ABC-XYZ分析（帕累托×需求波动性）、以及机器学习辅助的商品价值预测。'
    },

    concepts: {
      definitions: {
        '帕累托法则 (Pareto Principle)': "又称80/20法则，指80%的结果来自20%的原因。在商业中表现为：80%销售额来自20%商品，80%投诉来自20%问题，80%利润来自20%客户。",
        '累计占比 (Cumulative Percentage)': '按降序排列后，从最大值开始累加到当前值的总和占全部总和的百分比。用于确定帕累托分界点。',
        '爆款 (Top Seller)': '累计占比80%以内的商品，数量少但贡献大，是营收主力。',
        '腰部商品 (Mid-range)': '累计占比80%-95%之间的商品，有一定贡献但非核心。',
        '长尾商品 (Long Tail)': '累计占比95%以上的商品，数量多但单个贡献低。长尾理论（Chris Anderson, 2006）认为互联网使长尾商品集合也具有可观价值。'
      },
      relationships: '帕累托法则是理论基础（80/20法则）；累计占比是计算工具（cumsum/total）；爆款/腰部/长尾是分析输出（分类标签）。三者构成"理论→计算→应用"的完整体系。'
    },

    techPoints: {
      selection: '选择Pandas groupby+sort+cumsum组合实现帕累托分析，这是最简洁高效的方案。相比SQL窗口函数，Pandas方案更易在Notebook中迭代验证。',
      parameters: 'sort_values(ascending=False)确保从高到低排列；cumsum()计算累计值；累计占比 = 累计值 / 总值。分类阈值：80%（爆款分界）、95%（腰部/长尾分界）。',
      methods: '①groupby+sum聚合商品销售额；②sort_values降序；③cumsum累计求和；④除以total得累计占比；⑤apply分类函数打标签。',
      risks: '风险1：样本量过少导致分类不准确（应对：至少20个商品）；风险2：极端爆款扭曲分布（应对：单独处理Top1）；风险3：时间窗口选择影响结果（应对：按业务周期选择分析时段）。'
    },

    completionCriteria: {
      functional: '成功计算各商品销售额；完成累计占比计算；正确分类爆款/腰部/长尾。',
      performance: '20个商品分析不超过2秒。',
      quality: '累计占比单调递增且最终为100%；分类逻辑正确；爆款商品数合理（约20%）。',
      security: '商品销售数据脱敏。',
      documentation: '代码包含帕累托原理注释；输出包含分类统计。',
      experience: '结果以可视化友好的格式输出，含占比进度条。'
    },

    initialCode: `import pandas as pd
import numpy as np

# 模拟商品销售数据
np.random.seed(42)
products = ['商品%d' % i for i in range(1, 21)]
sales = np.random.exponential(scale=500, size=20)
sales[3] = 8000
sales[7] = 6500
sales[0] = 5000
sales[12] = 4500

df = pd.DataFrame({
    'product': products,
    'sales': sales
})
print("商品销售数据:")
print(df.sort_values('sales', ascending=False))
print()

# 任务1: 计算单品销售额 (已汇总)
product_sales = df.groupby('product')['sales'].sum().sort_values(ascending=False)

# 任务2: 计算累计占比
total_sales = product_sales.sum()
cumulative = product_sales.cumsum()
cumulative_pct = cumulative / total_sales * 100

pareto = pd.DataFrame({
    'product': product_sales.index,
    'sales': product_sales.values,
    'cumulative_sales': cumulative.values,
    'cumulative_pct': cumulative_pct.values
})

print("帕累托分析:")
print(pareto)
print()

# 任务3: 根据累计占比分类
def classify(pct):
    if pct <= 80:
        return '爆款 (Top 20%%)'
    elif pct <= 95:
        return '腰部商品'
    else:
        return '长尾商品'

pareto['category'] = pareto['cumulative_pct'].apply(classify)

print("=" * 60)
print("商品分类结果:")
print("=" * 60)
for cat in ['爆款 (Top 20%%)', '腰部商品', '长尾商品']:
    items = pareto[pareto['category'] == cat]
    print("\\n【%s】- %d件商品" % (cat, len(items)))
    for _, row in items.iterrows():
        bar = '\\u2588' * int(row['cumulative_pct'] / 5)
        print("  %s: $%.0f | 累计 %.1f%%%% %s" % (row['product'], row['sales'], row['cumulative_pct'], bar))

print("\\n总销售额: $%.0f" % total_sales)
top20 = pareto[pareto['category'] == '爆款 (Top 20%%)']['sales'].sum()
print("爆款贡献: $%.0f (%.1f%%%%)" % (top20, top20/total_sales*100))
print("\\n✅ 帕累托分析完成!")`,

    referenceCode: `import pandas as pd
import numpy as np

np.random.seed(42)
products = ['商品%d' % i for i in range(1, 21)]
sales = np.random.exponential(scale=500, size=20)
sales[3] = 8000; sales[7] = 6500; sales[0] = 5000; sales[12] = 4500

df = pd.DataFrame({'product': products, 'sales': sales})
product_sales = df.groupby('product')['sales'].sum().sort_values(ascending=False)

total = product_sales.sum()
cumulative_pct = product_sales.cumsum() / total * 100

pareto = pd.DataFrame({'product': product_sales.index, 'sales': product_sales.values, 'cumulative_pct': cumulative_pct.values})

def classify(pct):
    if pct <= 80: return '爆款'
    elif pct <= 95: return '腰部'
    else: return '长尾'

pareto['category'] = pareto['cumulative_pct'].apply(classify)
print("爆款数:", (pareto['category'] == '爆款').sum())
print("爆款贡献:", "%.1f%%" % (pareto[pareto['category']=='爆款']['sales'].sum()/total*100))`
  },

  {
    id: 10,
    name: '端到端实战：购物篮聚类与个性化推荐报告',
    difficulty: 'advanced',
    tags: ['共现矩阵', '交叉销售', 'K-Means', '业务洞察'],
    category: '综合实战',

    background: {
      description: '整合所有技能：构建商品共现矩阵、用户品类偏好聚类、输出业务洞察报告。',
      origin: '端到端数据分析项目模拟了真实业务场景的完整分析流程。从数据读取到最终报告，覆盖数据工程师、数据分析师、业务顾问三个角色的工作内容。这是数据科学项目中最高级别的综合实践。',
      audience: '数据科学从业者、商业分析师、咨询顾问、数据团队负责人。',
      environment: '电商推荐系统优化、交叉销售策略制定、用户画像与个性化营销。',
      problem: '需要从订单表出发，先做购物车商品共现矩阵，再做用户聚类，最终输出一份数据分析报告，为业务决策提供依据。',
      significance: '端到端能力是数据分析师的核心竞争力。能将技术分析转化为业务洞察的人，才能为企业创造实际价值。',
      industryData: '据LinkedIn技能报告，"端到端数据分析"是2024年最需求的数据技能；具备端到端能力的数据分析师薪资比单一技能者高40%。'
    },

    tasks: [
      {
        goal: '构建商品共现矩阵（Pandas实现矩阵乘法：df.T.dot(df)），找出强关联Top10商品对',
        responsible: '数据分析师',
        timeline: '第1步，预计30分钟',
        deliverable: '商品共现矩阵 + Top10关联商品对列表'
      },
      {
        goal: '基于用户购买品类偏好（用crosstab做One-Hot）进行K-Means聚类',
        responsible: '数据分析师',
        timeline: '第2步，预计30分钟',
        deliverable: '用户聚类结果 + 各簇品类偏好特征'
      },
      {
        goal: '撰写数据解读报告',
        responsible: '数据分析师',
        timeline: '第3步，预计30分钟',
        deliverable: 'Markdown格式分析结论，包含业务建议'
      }
    ],

    knowledge: {
      theory: '端到端数据分析整合了数据清洗、数据重塑、统计分析和机器学习四大技能模块。商品共现矩阵基于线性代数中的矩阵乘法原理；用户聚类基于无监督学习中的K-Means算法；业务解读需要结合领域知识和数据洞察。',
      practice: '端到端项目标准流程：①数据加载与清洗；②特征工程（共现矩阵、品类偏好）；③分析建模（关联分析、聚类）；④结果解读（业务标签、建议）；⑤报告撰写。每个环节的输出是下一环节的输入。',
      frontier: '当前前沿包括：AutoML端到端管道（自动完成特征工程到模型选择）、LLM辅助数据分析（用自然语言描述分析需求）、以及实时分析管道（流式数据实时分析+报告生成）。'
    },

    concepts: {
      definitions: {
        '共现矩阵 (Co-occurrence Matrix)': '记录商品对在同一订单中同时出现次数的矩阵。通过品类×订单的交叉表转置自乘得到。对角线为0（自身共现无意义）。',
        '交叉销售 (Cross-Sell)': '向已购买某商品的客户推荐相关商品的销售策略。如向买手机的用户推荐手机壳。基于共现矩阵发现的强关联商品对。',
        '品类偏好 (Category Preference)': '用户购买各品类的相对倾向，通过crosstab统计每个用户在各类别的购买次数得到。',
        '业务洞察 (Business Insight)': '从数据分析结果中提炼出的、对业务决策有指导价值的结论。好的洞察应具备：可操作性（指导具体行动）、可量化（有数据支撑）、可解释（业务人员能理解）。'
      },
      relationships: '共现矩阵发现商品级关联（哪些商品常被一起购买）；聚类分析发现用户级分组（哪些用户有相似偏好）；交叉销售是关联分析的商业应用；业务洞察是最终的价值输出。四者构成"商品关联→用户分组→商业应用→决策支持"的完整价值链。'
    },

    techPoints: {
      selection: '选择矩阵乘法(T.dot)实现共现矩阵，因为这是最简洁高效的方案。选择crosstab构建品类偏好One-Hot矩阵，因为自动处理缺失值且输出格式规整。',
      parameters: '矩阵乘法：pivot.T.dot(pivot)，pivot为品类×订单交叉表。K-Means：k=3（演示用），实际业务建议用肘部法则确定。标准化：(X - mean) / std。',
      methods: '①crosstab构建品类×订单交叉表；②.T.dot()矩阵乘法得共现矩阵；③np.fill_diagonal设对角为0；④标准化后K-Means聚类；⑤groupby统计簇特征；⑥输出业务解读报告。',
      risks: '风险1：品类过多导致共现矩阵过大（应对：只分析Top品类）；风险2：聚类结果不稳定（应对：固定random_state）；风险3：业务解读脱离数据（应对：用数据支撑每个结论）。'
    },

    completionCriteria: {
      functional: '成功构建共现矩阵并找出Top10商品对；完成用户品类偏好聚类；输出完整业务洞察报告。',
      performance: '50个订单的端到端分析不超过10秒。',
      quality: '共现矩阵对称且对角线为0；聚类结果合理（每簇有明确特征）；报告建议有数据支撑。',
      security: '订单和用户数据脱敏。',
      documentation: '完整Markdown格式报告，包含分析过程和结论。',
      experience: '报告格式专业，结论清晰，建议可执行。'
    },

    initialCode: `import pandas as pd
import numpy as np

# 模拟订单-商品数据
np.random.seed(42)
orders = []
for oid in range(1, 51):
    n_items = np.random.randint(2, 6)
    cats = np.random.choice(['母婴', '清洁', '食品', '数码', '服饰', '家居'], size=n_items, replace=False)
    for cat in cats:
        orders.append({'order_id': oid, 'category': cat})

df = pd.DataFrame(orders)
print("订单数据 (前10行):")
print(df.head(10))
print()

# 任务1: 构建商品共现矩阵
pivot = pd.crosstab(df['order_id'], df['category'])
cooccurrence = pivot.T.dot(pivot)
np.fill_diagonal(cooccurrence.values, 0)

print("商品共现矩阵:")
print(cooccurrence)
print()

# 找Top10强关联商品对
pairs = []
for cat1 in cooccurrence.columns:
    for cat2 in cooccurrence.columns:
        if cat1 != cat2:
            val = cooccurrence.loc[cat1, cat2]
            pairs.append((cat1, cat2, val))
pairs.sort(key=lambda x: -x[2])

print("=" * 50)
print("Top 10 强关联商品对:")
print("=" * 50)
for c1, c2, v in pairs[:10]:
    print("  %s \\u2194 %s: %d次共现" % (c1, c2, v))
print()

# 任务2: 用户品类偏好聚类
user_pref = pd.crosstab(df['order_id'], df['category'])
user_pref_norm = (user_pref - user_pref.mean()) / user_pref.std()

def kmeans(X, k=3, max_iter=50):
    np.random.seed(42)
    centers = X[np.random.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        dists = np.array([[np.sqrt(((x-c)**2).sum()) for c in centers] for x in X])
        labels = np.argmin(dists, axis=1)
        centers = np.array([X[labels==i].mean(axis=0) for i in range(k)])
    return labels, centers

X = user_pref_norm.values
labels, centers = kmeans(X, 3)
user_pref['cluster'] = labels

# 任务3: 输出分析报告
print("=" * 60)
print("\\U0001f4ca 购物篮聚类与个性化推荐报告")
print("=" * 60)

for c in range(3):
    cluster = user_pref[user_pref['cluster'] == c]
    prefs = cluster.mean().drop('cluster')
    top_cat = prefs.idxmax()
    n_users = len(cluster)
    pct = n_users / len(user_pref) * 100

    sec_cat = prefs.drop(top_cat).idxmax()
    print("\\n\\U0001f4cc 聚类%d (%.0f%%%%用户)" % (c, pct))
    print("   主偏好: %s" % top_cat)
    print("   次偏好: %s" % sec_cat)
    print("   \\U0001f4a1 建议: 在%s页面推荐%s商品 (交叉销售)" % (top_cat, sec_cat))

print("\\n\\u2705 端到端分析完成!")`,

    referenceCode: `import pandas as pd
import numpy as np

np.random.seed(42)
orders = []
for oid in range(1, 51):
    n_items = np.random.randint(2, 6)
    cats = np.random.choice(['母婴', '清洁', '食品', '数码', '服饰', '家居'], size=n_items, replace=False)
    for cat in cats:
        orders.append({'order_id': oid, 'category': cat})

df = pd.DataFrame(orders)
pivot = pd.crosstab(df['order_id'], df['category'])
cooccurrence = pivot.T.dot(pivot)
np.fill_diagonal(cooccurrence.values, 0)

user_pref = pd.crosstab(df['order_id'], df['category'])
user_pref_norm = (user_pref - user_pref.mean()) / user_pref.std()

def kmeans(X, k=3, max_iter=50):
    np.random.seed(42)
    centers = X[np.random.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        dists = np.array([[np.sqrt(((x-c)**2).sum()) for c in centers] for x in X])
        labels = np.argmin(dists, axis=1)
        centers = np.array([X[labels==i].mean(axis=0) for i in range(k)])
    return labels

labels = kmeans(user_pref_norm.values, 3)
print("分析完成, 商品类别数:", len(cooccurrence.columns))
print("聚类数: 3")`
  }
]

export function getProjectById(id) {
  return projects.find(p => p.id === id)
}

export function getProjectsByCategory(categoryId) {
  if (categoryId === 'all') return projects
  return projects.filter(p => p.difficulty === categoryId)
}

export function getPopularProjects() {
  return projects.slice(0, 6)
}
