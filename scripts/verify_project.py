#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
fail=[]; ok=[]

def req(rel):
    p=ROOT/rel
    if p.exists() and p.stat().st_size>0: ok.append(rel)
    else: fail.append(f'AUSENTE/VAZIO: {rel}')

required=['index.html','css/styles.css','js/menu.js','js/app.js','manifest.webmanifest','netlify.toml','_redirects','sw.js','favicon.ico','apple-touch-icon.png','server.js','package.json','Dockerfile']
for p in required: req(p)

menu_text=(ROOT/'js/menu.js').read_text(encoding='utf-8')
m=re.search(r'=\s*(\[.*\])\s*;?\s*$', menu_text, re.S)
if not m:
    fail.append('Não foi possível ler os dados do js/menu.js')
    data=[]
else:
    try: data=json.loads(m.group(1))
    except Exception as e:
        fail.append(f'JSON do menu inválido: {e}')
        data=[]

if data:
    ids=[s.get('id') for s in data]
    if len(ids)!=len(set(ids)): fail.append('IDs de categorias duplicados')
    pizza_ids=['pizzas','pizzas-especiais','pizzas-pai-degua','pizzas-da-casa']
    pizza_sections=[s for s in data if s.get('id') in pizza_ids]
    pizza_count=sum(len(s.get('items',[])) for s in pizza_sections)
    if pizza_count!=31: fail.append(f'Pizzas: esperado 31, encontrado {pizza_count}')
    massas=next((s for s in data if s.get('id')=='massas'),None)
    entradas=next((s for s in data if s.get('id')=='entradas'),None)
    if not massas or len(massas.get('items',[]))!=5: fail.append(f"Massas: esperado 5, encontrado {len((massas or {}).get('items',[]))}")
    if not entradas or len(entradas.get('items',[]))!=5: fail.append(f"Entradas: esperado 5, encontrado {len((entradas or {}).get('items',[]))}")
    if data[0].get('id')!='entradas': fail.append('Entradas não estão em primeiro lugar')
    expected=['entradas','pizzas','pizzas-especiais','pizzas-pai-degua','pizzas-da-casa']
    for i,e in enumerate(expected):
        if i>=len(data) or data[i].get('id')!=e: fail.append(f'Ordem primária incorreta na posição {i+1}: esperado {e}')
    names=[]
    for section in data:
        for item in section.get('items',[]):
            names.append(item.get('name',''))
            img=item.get('image','').split('?')[0]
            if img: req(img)
            else: fail.append(f"Imagem vazia: {item.get('name','sem nome')}")
            if not item.get('price'): fail.append(f"Preço vazio: {item.get('name','sem nome')}")
            if not item.get('description'): fail.append(f"Descrição vazia: {item.get('name','sem nome')}")
    if len(names)!=len(set(names)): fail.append('Produtos duplicados pelo nome')
    if any(n.lower()=='atum' for n in names): fail.append('Atum ainda está no catálogo')
    total=sum(len(s.get('items',[])) for s in data)
    print(f'Categorias: {len(data)}')
    print(f'Pizzas: {pizza_count} em {len(pizza_sections)} categorias')
    print(f'Massas: {len((massas or {}).get("items",[]))}')
    print(f'Entradas: {len((entradas or {}).get("items",[]))}')
    print(f'Produtos totais: {total}')

html=(ROOT/'index.html').read_text(encoding='utf-8')
for ref in re.findall(r'(?:src|href)=["\']([^"\'#]+)["\']', html):
    ref=ref.split('?')[0]
    if re.match(r'^(?:https?:|mailto:|tel:)',ref): continue
    if '{{' in ref: continue
    req(ref.lstrip('/'))
for needle,msg in [
    ('id="menu-sections-primary"','Host primário ausente'),
    ('href="#entradas"','Link para Entradas ausente'),
    ('href="#pizzas"','Link para Pizzas ausente'),
    ('Começar pelas entradas','CTA inicial não começa pelas Entradas'),
    ('Ver pizzas por categoria','CTA de Pizzas por categoria ausente'),
    ('id="menu-sections-secondary"','Host secundário ausente'),
    ('responsaveis-pai-degua','Seção Rute e Cley ausente'),
    ('footer__credit','Crédito G Tech ausente'),
    ('data-order-choice','Modal salão/delivery não conectado'),
]:
    if needle not in html: fail.append(msg)
if re.search(r'href=["\']#["\']',html): fail.append('href="#" encontrado')

css=(ROOT/'css/styles.css').read_text(encoding='utf-8')
if 'productFloatMobile' not in css: fail.append('Movimento mobile dos produtos ausente')

# Cache-busting final obrigatório para evitar imagens antigas no navegador/service worker
version='20260814-railway-final-v10'
for rel in ['index.html','js/menu.js','sw.js']:
    text=(ROOT/rel).read_text(encoding='utf-8')
    if version not in text: fail.append(f'Versão final de cache ausente em {rel}')

# Imagens corrigidas nesta entrega
final_images=[
'assets/images/camarao-empanado-molho-abacaxi.webp',
'assets/images/entrada-batata-frita.webp',
'assets/images/entrada-bolinho-frito-molho-branco.png',
'assets/images/entrada-macaxeira-frita.webp',
'assets/images/entrada-pasteizinhos-fritos-molho-especial.webp',
'assets/images/massa-farfalle-de-camarao-ao-molho-branco-card-master.webp',
'assets/images/massa-mignon-ao-penne-card-master.webp',
'assets/images/massa-monte-sua-massa-card-master.webp',
'assets/images/massa-penne-ao-molho-de-calabresa-e-bacon-card-master.webp',
'assets/images/massa-bavette-a-parisiense-card-master.webp',
]
for p in final_images: req(p)

# Contatos e unidades finais
for needle,msg in [
    ('5591982486925','WhatsApp Coqueiro oficial ausente'),
    ('5591988424248','WhatsApp Batista Campos oficial ausente'),
    ('Tv. We 6 Cj Satélite, 454 - Coqueiro, Belém - PA, 66670-420, Brasil','Endereço Coqueiro ausente'),
    ('R. dos Mundurucus, 1427 - Batista Campos, Belém - PA, 66033-716','Endereço Batista Campos ausente'),
    ('https://pedido.anota.ai/loja/paideguapizzasartesanais?f=msa','Pedido oficial Coqueiro ausente'),
    ('https://pedido.anota.ai/loja/pai-degua-pizzas-artesanais-1?f=msa','Pedido oficial Batista Campos ausente'),
]:
    if needle not in html: fail.append(msg)
if '5591982064743' in html or '5591982064743' in (ROOT/'js/app.js').read_text(encoding='utf-8'):
    fail.append('Número genérico antigo ainda presente')
if 'entrada-batata-frita-final100.webp' in menu_text:
    fail.append('Menu ainda referencia nome temporário da batata')
if 'Terça da Sobremesa' not in html: fail.append('Promoção final Terça da Sobremesa ausente')
if 'Quinta das Bordas' not in html: fail.append('Promoção final Quinta das Bordas ausente')
if 'Sexta do Buteco' not in html: fail.append('Promoção final Sexta do Buteco ausente')
if 'Em dezembro, a Pai D’Égua completa 10 anos' not in html: fail.append('História final de Rute e Cley não atualizada')
if 'https://pedido.anota.ai/loja/paideguapizzasartesanais?f=msa' not in html: fail.append('Link Mult Loja do Coqueiro ausente')
if 'https://pedido.anota.ai/loja/paidegua-pizzas-artesanais?qrcode=' in html: fail.append('Link antigo do Coqueiro ainda presente')

if 'assets/images/entrada-batata-frita.webp?v=20260814-railway-final-v10' not in menu_text:
    fail.append('Batata final não está referenciada com cache-busting novo')

# Ajustes finais V9
if '"name": "Bolinho de Macaxeira com Charque"' not in menu_text:
    fail.append('Nome final do bolinho de macaxeira com charque ausente')
if 'assets/images/entrada-bolinho-frito-molho-branco.png?v=20260814-railway-final-v10' not in menu_text:
    fail.append('Imagem final PNG do bolinho não está referenciada')
if 'assets/images/pizza-havaiana-card-master.png?v=20260814-railway-final-v10' not in menu_text:
    fail.append('Imagem final PNG da Havaiana não está referenciada')
m_bol = re.search(r'"name": "Bolinho de Macaxeira com Charque".*?"description": "([^"]+)"', menu_text, re.S)
if not m_bol:
    fail.append('Descrição final do bolinho não encontrada')
elif 'molho' in m_bol.group(1).lower():
    fail.append('Descrição do bolinho ainda menciona molho')
if 'responsaveis-pai-degua-v9.webp?v=20260814-railway-final-v10' not in html:
    fail.append('Imagem V9 de Rute e Cley não está referenciada')

if fail:
    print('\nFALHAS:')
    for x in sorted(set(fail)): print('- '+x)
    sys.exit(1)
print(f'\nOK — projeto validado. {len(set(ok))} caminhos conferidos sem ausência.')
