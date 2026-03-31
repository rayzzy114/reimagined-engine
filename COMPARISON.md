# Сравнение с референсной игрой (Runner)

Этот файл содержит данные, собранные в ходе анализа референса `https://playbox.play.plbx.ai/playoff/runner` и текущего состояния проекта.

## Основные параметры (Canvas & World)

| Параметр | Референс (Reference) | Текущий проект (Local) | Файл в проекте |
| :--- | :--- | :--- | :--- |
| **Design Width** | 720 px | 720 px | `constants.ts` |
| **Design Height** | 1280 px | 1280 px | `constants.ts` |
| **Ground Y** | 1000 px (1280 - 280) | 921.6 px (1280 * 0.72) | `Player.ts`, `Level.ts` |
| **Spawn X** | 1080 px (720 + 360) | 820 px (720 + 100) | `Level.ts` |

---

## Персонажи (Characters)

### Player (Girl)
- **Scale:** 0.54 (исправлено)
- **Hitbox (Ref):** scale {X: 0.25, Y: 0.7}, offset {X: 0, Y: -0.15}
- **Hitbox (Local):** w = width * 0.6, h = height * 0.8 (`Player.ts`)
- **Anim Speed:** 0.15 (run), 0.225 (jump), 0.30 (hurt)
- **Anim Speed (Local):** 0.2 (run), 0.15 (jump/hurt)

### Enemy (Thief)
- **Scale:** 0.702 (исправлено)
- **Hitbox (Ref):** scale {X: 0.3, Y: 0.5}, offset {X: 0, Y: 0.2}
- **Hitbox (Local):** w = width * 0.7, h = height * 0.8 (`Level.ts`)
- **Speed:** 900 px/s (600 base + 300 chase)
- **Speed (Local):** 690 px/s (600 base + 300 * 0.3)

---

## Геймплей и Физика (Gameplay & Physics)

| Параметр | Референс (Reference) | Текущий проект (Local) |
| :--- | :--- | :--- |
| **Base Speed** | 600 px/s | 600 px/s |
| **Jump Height** | 300 | 300 |
| **Jump Duration** | 800 ms | 800 ms |
| **Lives (HP)** | 3 сердца | 3 сердца |
| **Invincibility** | 500 ms | 500 ms |
| **Blink Effect** | Переключение тинта (White/Red) | Мигание альфой (0.3 - 1.0) |
| **Obstacle Hit** | -1 HP + Invincibility | **Instant Game Over** (Ошибка!) |
| **Obstacle Check** | Всегда проверяет | Пропускает, если игрок в прыжке |

---

## Объекты и Скейлы (Object Scales)

- **Collectible (Dollar):** Ref 0.15 vs Local 0.35 (Нужно уменьшить)
- **Collectible (Paypal):** Ref 0.18 (В локальном проекте отсутствует)
- **Obstacle (Bush):** Ref 0.45-0.6 vs Local 0.5
- **Obstacle Glow:** В референсе есть пульсирующее свечение (scale 0.8, alpha 0.8), в локальном нет.
- **Lamp/Tree:** Ref ~1.8

---

## План действий для Кодекса (TODO)

1. **Исправить Ground Y:** В референсе линия земли ниже (1000px vs 921px). Нужно привести к единому знаменателю.
2. **Синхронизировать Hitbox:** Перейти от множителей 0.6/0.8 к точным значениям из референса для игрока и врагов.
3. **Логика препятствий:**
   - Исправить мгновенную смерть от кустов на потерю жизни.
   - Добавить проверку коллизии с кустами даже в прыжке (или убедиться, что она корректна).
4. **Визуальные эффекты:**
   - Заменить мигание альфой на тинт (0xFFFFFF <-> 0xFF2244) при уроне.
   - Добавить пульсацию и свечение (glow_sprite) для препятствий и монеток.
5. **Скорость врагов:** Увеличить дополнительную скорость погони до полных 300 px/s.
6. **Collectible Scale:** Уменьшить скейл долларов до 0.15.
7. **Level Layout:** Сверить массив расстояний `Gl` из референса с текущим `Level.ts`.
