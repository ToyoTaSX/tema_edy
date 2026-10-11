"""Собирает content/menu.json из raw/vk_market_*.txt (выгрузка товаров группы ВК)."""
import re, json, sys, pathlib
base = pathlib.Path(__file__).resolve().parent.parent
src = sorted((base/'raw').glob('vk_market_*.txt'))[-1]
rows=[]
for line in open(src,encoding='utf-8'):
    if line.startswith('#') or not line.strip(): continue
    p=[x.strip() for x in line.rstrip('\n').split('‖')]
    rows.append(dict(id=p[0],name_vk=p[1],cat_vk=p[2],price=int(p[3]),desc_vk=p[4]))

fix_log=[]
def fx(s, pairs, field, rid):
    for a,b in pairs:
        if a in s:
            s=s.replace(a,b); fix_log.append(f"{rid} [{field}]: «{a}» → «{b}»")
    return s
NAME_FIX=[('кукурозой','кукурузой'),('Яичница с двумя жаренными сосисками и','Яичница с двумя жареными сосисками'),
 ('жаренным яйцом','жареным яйцом'),('Мороженное','Мороженое'),('Хачапури по - аджарски','Хачапури по-аджарски'),
 ('Стейк семги/форели','Стейк сёмги / форели'),('Пицца 4 сыра','Пицца «4 сыра»'),('Хот дог','Хот-дог'),('Френч дог','Френч-дог'),
 ('Чикен бургер','Чикен-бургер'),('Биг бургер','Биг-бургер'),('Бизнес ланч','Бизнес-ланч'),('Красное море','Салат «Красное море»')]
DESC_FIX=[('Хрустяшая','Хрустящая'),('фоуктовым','фруктовым'),('поддерживается правильного','придерживается правильного'),
 ('медово горничная','медово-горчичная'),('Мороженное','Мороженое'),('0,3 мл','0,3 л'),('Сет их 6 шт','Сет из 6 шт'),
 ('ширирача','шрирача'),('голланский','голландский'),('поджареная','поджаренная'),('Хачапури по - аджарски','Хачапури по-аджарски'),
 ('пицце соус','пицца-соус'),('Хрустящие булка','Хрустящая булка'),('Хрустящая Булочка','Хрустящая булочка'),
 ('Сладкий пончик. покрытый','Сладкий пончик, покрытый'),('по корейски','по-корейски'),('по- корейски','по-корейски'),
 ('семги/форели','сёмги / форели'),('свинина- говядина','свинина-говядина'),('~10\\12 шт','10–12 шт'),('бургер соус','бургер-соус'),
 ('цезарь соус','соус «Цезарь»'),('соус горчица','горчичный соус')]

def quotes(s): return re.sub(r'"([^"]+)"', lambda m:'«'+m.group(1).strip()+'»', s)
def tidy(s):
    s=re.sub(r'\s+',' ',s)
    s=re.sub(r'\s+([,.:;)])',r'\1',s)
    s=re.sub(r'(?<=\D),(?=\S)',', ',s)          # пробел после запятой (кроме десятичных)
    s=re.sub(r'(\d),\s+(\d)',r'\1,\2',s)          # «2, 5» → «2,5»
    s=re.sub(r'(\w)\(',r'\1 (',s); s=re.sub(r'\(\s+','(',s)
    s=re.sub(r'(\d)\s*-\s*(\d)',r'\1–\2',s)       # диапазоны
    s=re.sub(r'\b(\d+)\s*гр\b',r'\1 г',s)
    return s.strip()
def lcfirst(s):
    return s[:1].lower()+s[1:] if s and not re.match(r'[A-ZА-ЯЁ]{2}',s) else s

CATS=[('lunch','Бизнес-ланч и комплексы'),('soups','Супы'),('salads','Салаты и закуски'),('hot','Горячие блюда и паста'),
 ('grill','Мангал и гриль'),('pizza','Пицца'),('burgers','Бургеры, хот-доги, сэндвичи'),('shawarma','Шаурма и лаваш'),
 ('fryer','Фритюр'),('breakfast','Завтраки: каши и яичница'),('bakery','Выпечка'),('desserts','Десерты'),('drinks','Напитки')]
def cat(r):
    n=r['name_vk'].lower(); c=r['cat_vk']
    if 'бизнес ланч' in n or 'комплексный' in n: return 'lunch'
    if 'яичница' in n or c=='Каши': return 'breakfast'
    if c=='Супы' or 'шурпа' in n or 'окрошка' in n: return 'soups'
    if n.startswith('паста'): return 'hot'
    if 'пицца' in n: return 'pizza'
    if 'шаурма' in n or 'в лаваше' in n or 'мак ролл' in n: return 'shawarma'
    if c in('Шашлык и гриль','Курица','Сёмга') or 'стейк' in n or 'деревенский' in n: return 'grill'
    if c in('Картошка фри','Наггетсы'): return 'fryer'
    if c.startswith('Бургеры') or 'набор' in n: return 'burgers'
    if c=='Салаты и закуски': return 'salads'
    if c in('Горячие блюда','Еда на заказ'): return 'hot'
    if c=='Выпечка и сдоба': return 'bakery'
    if 'коктейль' in n or c.startswith('Торты') or 'десерт' in c.lower(): return 'desserts'
    return 'drinks'

PORTION_RE=re.compile(r'(?:вес\s*)?(~|≈)?\s*(\d+(?:\s*[–-]\s*\d+)?)\s*(гр|г)\b',re.I)
def parse_desc(d, name):
    parts=[x.strip() for x in d.split('¦') if x.strip()]
    portion=unit=None; notes=[]; comp=[]
    for x in parts:
        xl=x.lower().strip()
        if re.fullmatch(r'цена (за|указана за|курицы за) (100 гр|1 кг)',xl):
            unit='за 100 г' if '100' in xl else 'за 1 кг'; continue
        if xl.startswith('цена сета'):
            continue   # расходится с ценой товара; правило заказчика — берём более высокую (цену товара)
        if re.match(r'цена за 100 гр\s*-',xl):
            notes.append(x); continue
        m=re.fullmatch(r'(вес\s*)?[~≈]?\s*\d+\s*([–-]\s*\d+\s*)?(гр|г)\.?',xl)
        if m: portion=x; continue
        if re.fullmatch(r'\d+\s*см',xl): portion='Ø '+x; continue
        if re.fullmatch(r'\d+([,.]\d+)?\s*(мл|л)',xl) or re.fullmatch(r'0[,.]\s?\d+',xl):
            portion=x if re.search('л',xl) else re.sub(r'\s','',x)+' л'; continue
        if any(k in xl for k in('предзаказ','время ожидания')): notes.append(x); continue
        if xl.startswith(('по желанию','подходит','есть возможность','первые блюда','вторые от','салаты от','котлетки могут','цена указана')): notes.append(x); continue
        if xl==name.lower(): continue
        comp.append(x)
    text=tidy(quotes(', '.join([comp[0]]+[lcfirst(c) for c in comp[1:]]) if comp else ''))
    text=re.sub(r':,',':',text); text=re.sub(r'^Состав\s*:\s*','',text)
    if portion is None:   # порция внутри текста: «150 гр луковых колец», «фри 150 гр»
        m=PORTION_RE.search(text)
        if m and not re.search(r'(шашлык|филе|дольки) *$', text[:m.start()].lower()) and 'кажд' not in text[m.end():m.end()+10]:
            if re.search(r'^\s*(\d+ г)\s', text[m.start():]) or len(comp)<=3: portion=tidy(m.group(0))
    if portion: portion=tidy(portion.replace('Вес','').replace('~','≈ ')).replace('≈  ','≈ ')
    return text[:1].upper()+text[1:], portion, unit, [tidy(n) for n in notes]

# Ручные уточнения порций, где автоматический разбор ошибается
PORTION_OVERRIDE={'6281107':'6 × 110 г','8059627':None,'6285560':'700 г','5378312':'10–12 шт','4846275':'150 г','4846268':'6 шт'}
items=[]
for r in rows:
    name=tidy(quotes(fx(r['name_vk'],NAME_FIX,'name',r['id'])))
    d=fx(r['desc_vk'],DESC_FIX,'desc',r['id'])
    comp,portion,unit,notes=parse_desc(d,r['name_vk'])
    if r['id'] in PORTION_OVERRIDE: portion=PORTION_OVERRIDE[r['id']]
    comp=re.sub(r',\s*,',',',comp); comp=re.sub(r'^Хачапури по-аджарски, состав:\s*','',comp); comp=comp[:1].upper()+comp[1:]
    if not comp and 'сок' in name.lower(): comp='Сок в ассортименте'
    items.append(dict(id=r['id'],name=name,category=cat(r),price=r['price'],price_unit=unit,portion=portion,
        composition=comp,notes=notes,preorder=any('предзаказ' in n.lower() for n in notes),
        vk_url=f"https://vk.ru/market-99941253?w=product-99941253_{r['id']}",
        source={"name":r['name_vk'],"category":r['cat_vk'],"description":r['desc_vk']}))
# Фото из content/photos.json (если есть)
ph_path=base/'photos.json'
photos=json.load(open(ph_path,encoding='utf-8'))['photos'] if ph_path.exists() else {}
for it in items:
    p=photos.get(it['id'])
    it['image']=dict(src=p['file'], sizes=[160,480], format='webp', kind=p['kind'], alt=p['alt']) if p else None
order={k:i for i,(k,_) in enumerate(CATS)}
items.sort(key=lambda x:(order[x['category']],x['price'],x['name']))
out=dict(_source=f"Товары группы ВК https://vk.ru/market-99941253 ({src.name}). Поле source — оригинал без правок.",
  updated=re.search(r'\d{4}-\d{2}-\d{2}',src.name).group(0), currency="RUB",
  disclaimer="Цены и состав меню могут отличаться, уточняйте по телефону. Фото блюд могут отличаться от подачи.",
  categories=[dict(id=k,title=t,count=sum(1 for i in items if i['category']==k)) for k,t in CATS], items=items)
json.dump(out,open(base/'menu.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
open(base/'raw'/'menu_fixes.log','w',encoding='utf-8').write('\n'.join(fix_log)+'\n')
print(len(items),'items;',len(fix_log),'fixes')
