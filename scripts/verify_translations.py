import json

d = json.load(open(r'c:\Users\luisg\HPE-NUEVO\js\translations.json', 'r', encoding='utf-8'))

tests = [
    'Dashboard',
    'Personalization',
    'Log out',
    'Add another account',
    'Profile',
    'Settings',
    'Help',
    'Companies',
    'DASHBOARD · TOP 5',
    'Live',
    'Chat',
    'Directorio de Tecnología',
    'Directorio Financiero',
    'Hola ¿En qué puedo ayudarte hoy con la infraestructura?',
    'Estrategias',
    'Educación Destacada',
    'Productos Destacados',
]

for t in tests:
    en = d['English'].get(t, 'MISSING')
    fr = d['French'].get(t, 'MISSING')
    status = '[OK]' if en != 'MISSING' and fr != 'MISSING' else '[MISS]'
    print(f'{status} "{t}"')
    print(f'   EN: {en}')
    print(f'   FR: {fr}')
    print()

print(f"Total English: {len(d['English'])}")
print(f"Total French: {len(d['French'])}")
print(f"Total Spanish: {len(d['Spanish'])}")
