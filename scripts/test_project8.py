import pandas as pd
import re

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
    pattern = r'[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：\"\"（）【】《》]'
    text = re.sub(pattern, '', text)
    return text.strip()

df['clean'] = df['comment'].apply(clean_text)
df['words'] = df['clean'].apply(lambda x: list(x) if x else [])

stop_words = {'的', '了', '吧', '是', '太', '很'}
df['filtered'] = df['words'].apply(lambda w: [x for x in w if x not in stop_words])

print('有效评论数:', (df['clean'] != '').sum())
for i, row in df.iterrows():
    print(row['review_id'], row['clean'][:20], row['filtered'][:10])
