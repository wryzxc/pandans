"""
参考答案代码验证脚本
用于检查 projects.js 中所有 referenceCode 的语法和逻辑正确性
"""

import ast
import sys

# 从 projects.js 提取的参考答案代码
reference_codes = {
    1: """
import pandas as pd
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
print(df)
""",
    2: """
import pandas as pd
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
print("会话数:", df['session_id'].nunique())
""",
    3: """
import pandas as pd
from itertools import combinations

cart_data = {
    'order_id': [1,1,1, 2,2, 3,3,3, 4,4,4, 5,5, 6,6,6,6],
    'product': ['尿布','啤酒','薯片', '牛奶','面包', '尿布','啤酒','纸巾', '面包','牛奶','鸡蛋', '啤酒','薯片', '尿布','啤酒','牛奶','纸巾']
}
df = pd.DataFrame(cart_data)

basket = df.groupby('order_id')['product'].apply(list).reset_index()

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

print("最强关联:", sorted(confidence.items(), key=lambda x: -x[1])[:3])
""",
    4: """
import pandas as pd
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

print("RFM分层完成, 客户数:", len(rfm))
""",
    5: """
import pandas as pd
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

print("聚类完成, 各簇人数:", df['cluster'].value_counts().to_dict())
""",
    6: """
import pandas as pd
import numpy as np

np.random.seed(42)
hours = pd.date_range('2024-01-01', periods=48, freq='H')
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
    print("[%s] %s GMV: $%.0f" % (a['type'], a['time'], a['value']))
""",
    7: """
import pandas as pd

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

attribution = pd.merge_asof(orders.sort_values('order_time'), clicks.sort_values('click_time'), on='user_id', left_on='order_time', right_on='click_time', direction='backward')

channel_stats = attribution.groupby('channel').agg(orders=('user_id', 'count'), revenue=('amount', 'sum'), cost=('cost', 'sum'))
channel_stats['roi'] = (channel_stats['revenue'] - channel_stats['cost']) / channel_stats['cost']

print("渠道ROI:", channel_stats['roi'].to_dict())
""",
    8: """
import pandas as pd
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
    if pd.isna(text): return ''
    text = re.sub(r'<[^>]+>', '', str(text))
    text = re.sub(r'[^\\w\\s，。！？]', '', text)
    return text.strip()

df['clean'] = df['comment'].apply(clean_text)
df['words'] = df['clean'].apply(lambda x: list(x) if x else [])

stop_words = {'的', '了', '吧', '是', '太', '很'}
df['filtered'] = df['words'].apply(lambda w: [x for x in w if x not in stop_words])

print("分词完成, 有效评论数:", (df['clean'] != '').sum())
""",
    9: """
import pandas as pd
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
print("爆款贡献:", "%.1f%%%%" % (pareto[pareto['category']=='爆款']['sales'].sum()/total*100))
""",
    10: """
import pandas as pd
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
print("聚类数: 3")
"""
}

def validate_code(project_id, code):
    """验证代码的语法正确性"""
    errors = []
    warnings = []
    
    # 1. 语法检查
    try:
        ast.parse(code)
    except SyntaxError as e:
        errors.append(f"语法错误: {e.msg} (行 {e.lineno}, 列 {e.offset})")
        return errors, warnings
    
    # 2. 检查 Python 2 风格的 print 语句
    lines = code.split('\n')
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('print ') and not stripped.startswith('print('):
            errors.append(f"行 {i}: Python 2 风格的 print 语句，应改为 print()")
    
    # 3. 检查常见的 Pyodide 兼容性问题
    if "format='mixed'" in code:
        warnings.append("使用了 format='mixed'，Pyodide 中的 Pandas 版本可能不支持")
    
    if "pd.merge_asof" in code:
        # 检查 merge_asof 参数
        if "on='user_id'" in code and ("left_on=" in code or "right_on=" in code):
            warnings.append("merge_asof 中同时使用了 on 和 left_on/right_on，可能导致参数冲突")
    
    # 4. 检查变量使用
    tree = ast.parse(code)
    defined_names = set()
    used_names = set()
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            if isinstance(node.ctx, ast.Store):
                defined_names.add(node.id)
            elif isinstance(node.ctx, ast.Load):
                used_names.add(node.id)
    
    # 检查常见的未定义变量
    builtin_names = {'pd', 'np', 'datetime', 'random', 're', 'len', 'print', 'range', 'sorted', 'sum', 'True', 'False', 'None'}
    undefined = used_names - defined_names - builtin_names
    if undefined:
        warnings.append(f"可能未定义的变量: {', '.join(undefined)}")
    
    return errors, warnings

def main():
    print("=" * 60)
    print("参考答案代码验证报告")
    print("=" * 60)
    
    total_errors = 0
    total_warnings = 0
    
    for project_id, code in reference_codes.items():
        print(f"\n【项目 {project_id}】")
        print("-" * 40)
        
        errors, warnings = validate_code(project_id, code)
        
        if errors:
            print("❌ 错误:")
            for err in errors:
                print(f"   - {err}")
            total_errors += len(errors)
        else:
            print("✅ 语法检查通过")
        
        if warnings:
            print("⚠️  警告:")
            for warn in warnings:
                print(f"   - {warn}")
            total_warnings += len(warnings)
    
    print("\n" + "=" * 60)
    print(f"验证完成: {total_errors} 个错误, {total_warnings} 个警告")
    print("=" * 60)
    
    return total_errors == 0

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
