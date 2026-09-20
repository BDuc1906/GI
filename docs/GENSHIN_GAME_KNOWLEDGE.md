# Genshin Impact - Chi Tiết Hệ Thống Game

## 1. Hệ Thống Nguyên Tố (Elemental System)

### 7 Nguyên Tố Chính
| Nguyên Tố | Tên Tiếng Việt | Mô Tả |
|-----------|---------------|-------|
| Pyro | Hỏa | Lửa |
| Hydro | Thủy | Nước |
| Cryo | Băng | Đá |
| Electro | Lôi | Sấm sét |
| Anemo | Phong | Gió |
| Geo | Nham | Đất |
| Dendro | Thảo | Thực vật |

### Elemental Reactions (Phản Ứng Nguyên Tố)

#### Transformative Reactions (Phản ứng chuyển đổi)
| Phản Ứng | Nguyên Tố | Hiệu Ứng |
|----------|-----------|----------|
| Overload | Pyro + Electro | Взрыв nổ AoE |
| Superconduct | Cryo + Electro | Giảm Physical RES |
| Electro-Charged | Electro + Hydro | LAN lan nguyên tố |
| Shatter | Cryo + Physical (trên Frozen) | ADD DMG |
| Burning | Pyro + Dendro | DMG theo thời gian |
| Bloom | Hydro + Dendro | Tạo Dendro Cores |
| Hyperbloom | Electro + Dendro Core | Tạo homing projectiles |
| Burgeon | Pyro + Dendro Core | Взрыв AoE |

#### Amplifying Reactions (Phản ứng khuếch đại)
| Phản Ứng | Nguyên Tố | Multiplier |
|----------|-----------|------------|
| Vaporize | Hydro aura + Pyro trigger | 2.0x (Pyro trên Hydro) |
| Melt | Cryo aura + Pyro trigger | 2.0x (Pyro trên Cryo) |
| Reverse Vaporize | Pyro aura + Hydro trigger | 1.5x |
| Reverse Melt | Pyro aura + Cryo trigger | 1.5x |

#### Shield Reactions (Phản ứng khiên)
| Phản Ứng | Nguyên Tố | Hiệu Ứng |
|----------|-----------|----------|
| Crystallize | Geo + Elemental | Tạo khiên elemental |
| Freeze | Cryo + Hydro | Đóng băng kẻ địch |

### Elemental Aura Mechanics
- **Gauge Units (U)**: Mỗi nguyên tố có độ mạnh khác nhau (1U, 2U, v.v.)
- **Aura Tax**: Khi áp dụng aura đầu tiên, giảm 20% (1U → 0.8U)
- **Decay Rate**: Aura tự yếu đi theo thời gian
- **Decay Rate Inheritance**: Khi áp dụng cùng nguyên tố, kế thừa decay rate

---

## 2. Hệ Thống Thánh Di Vật (Artifact System)

### Artifact Slots (5 phần)
| Slot | Tên | Main Stats Có Thể Có |
|------|-----|---------------------|
| Flower | Hoa | HP (fixed) |
| Plume | Lông | ATK (fixed) |
| Sands | Cát | ATK%, DEF%, HP%, EM, ER% |
| Goblet | Ly | ATK%, DEF%, HP%, EM, Physical DMG%, Elemental DMG% (x7) |
| Circlet | Vương Miện | ATK%, DEF%, HP%, EM, CRIT Rate%, CRIT DMG%, Healing Bonus% |

### Main Stats Priority (80% build quality)
| Vai Trò Nhân Vật | Sands | Goblet | Circlet |
|------------------|-------|--------|---------|
| Standard DPS | ATK% | Elemental DMG% | CRIT Rate/DMG |
| Reaction DPS | EM | EM | CRIT Rate/DMG |
| HP Scaler | HP% | HP% | CRIT Rate/DMG |
| DEF Scaler | DEF% | DEF% | CRIT Rate/DMG |
| Burst Support | ER% | Elemental DMG% | CRIT Rate/DMG |
| Reaction Support | EM | EM | EM |
| Healer (HP) | HP% | HP% | Healing Bonus% |
| Healer (ATK) | ATK% | ATK% | Healing Bonus% |

### Substats Priority (15% build quality)
| Vai Trò | Keep (S-Tier) | Feed Immediately |
|---------|----------------|-------------------|
| Main DPS | CRIT Rate, CRIT DMG, ATK%, EM (reaction) | DEF flat, ATK flat, HP flat, DEF% |
| Anemo Support | EM, ER% | All flats, ATK%, CRIT (low priority) |
| Healer/Shielder | HP%, ER%, ATK% (Bennett/Jean) | All flats, DEF% |
| DEF Scaler | DEF%, CRIT Rate, CRIT DMG | ATK%, HP%, all flats |
| HP Scaler | HP%, CRIT Rate, CRIT DMG | ATK%, DEF%, all flats |

### Artifact Level Values (5★ +20)
| Slot | HP | ATK | HP% | ATK% | DEF% | EM | ER% | CRIT Rate% | CRIT DMG% |
|------|-----|-----|-----|------|------|-----|-----|------------|------------|
| Flower | 4780 | - | - | - | - | - | - | - | - |
| Plume | - | 311 | - | - | - | - | - | - | - |
| Sands | - | - | 46.6% | 46.6% | 58.3% | 187 | 51.8% | 31.1% | 62.2% |
| Goblet | - | - | 46.6% | 46.6% | 58.3% | 187 | - | 31.1% | 62.2% |
| Circlet | - | - | 46.6% | 46.6% | 58.3% | 187 | - | 31.1% | 62.2% |

### Set Bonus Priority (5% build quality)
- **4-piece sets**: Chỉ dùng khi set bonus rất mạnh (e.g., Gilded Dreams, Deepwood Memories)
- **2-piece sets**: Thường tốt hơn cho đa số build
- **Hybrid sets**: 2-piece + 2-piece thường tối ưu hơn 4-piece

---

## 3. Hệ Thống Vũ Khí (Weapon System)

### Weapon Types (5 loại)
| Loại | Tên Tiếng Việt | Khoảng Cách |
|------|----------------|-------------|
| Sword | Kiếm đơn | Melee |
| Claymore | Trọng kiếm | Melee |
| Polearm | Kiếm dài | Melee |
| Bow | Cung | Ranged |
| Catalyst | Pháp khí | Ranged |

### Weapon Stats
- **Base ATK**: Sát thương cơ bản tăng theo level
- **Secondary Stat**: ATK%, DEF%, HP%, CRIT Rate%, CRIT DMG%, EM, ER%, Physical DMG%
- **Passive Effect**: Hiệu ứng đặc biệt vũ khí
- **Refinement**: Tăng cường passive effect (R1 → R5)

### Refinement System
- **R1**: Refinement 1 (mặc định)
- **R5**: Refinement 5 (tối đa)
- **R5 thường = 2x R1**
- **Cần copy vũ khí hoặc Refinement Material**
- **Refinement Costs**:
  - 3★: 500/1000/2000/4000 Mora
  - 4★: 1000/2000/4000/8000 Mora
  - 5★: 2000/4000/8000/16000 Mora

### Weapon Ascension (Phá Hoàn Vũ Khí)
| Phase | Max Level | AR Required | Mora Cost (5★) |
|-------|-----------|-------------|-----------------|
| None | Lv. 20 | - | - |
| 1st | Lv. 40 | AR 15 | 10,000 |
| 2nd | Lv. 50 | AR 25 | 20,000 |
| 3rd | Lv. 60 | AR 30 | 30,000 |
| 4th | Lv. 70 | AR 35 | 45,000 |
| 5th | Lv. 80 | AR 40 | 55,000 |
| 6th | Lv. 90 | AR 50 | 65,000 |

### Weapon Ascension Materials by Region
| Region | Domain | Materials |
|--------|--------|-----------|
| Mondstadt | Cecilia Garden | Decarabian, Dandelion Gladiator |
| Liyue | Hidden Palace of Lianshan Formula | Guyun, Aerosiderite |
| Inazuma | Court of Flowing Sand | Mask of the Kijin, Narukami |
| Sumeru | Tower of Abject Pride | Forest Dew, Oasis Garden |
| Fontaine | Echoes of the Deep Tides | IPS, Scorching |
| Natlan | Ancient Watchtower | TBD |

---

## 4. Thiên Phú & Cung Mệnh (Talents & Constellations)

### Talent Types
| Loại | Tên | Mô Tả |
|------|-----|-------|
| Normal Attack | Tấn công thường | 5 đòn đánh + Charged + Plunging |
| Elemental Skill | Kỹ năng nguyên tố | E - cooldown ngắn |
| Elemental Burst | Kỹ năng nổ | Q - cooldown dài, cần Energy |

### Talent Priority Order
| Vai Trò | Priority Thường |
|---------|------------------|
| Main DPS (Normal-based) | Normal Attack > Burst > Skill |
| Main DPS (Skill-based) | Skill > Burst > Normal Attack |
| Main DPS (Burst-based) | Burst > Skill > Normal Attack |
| Sub DPS | Skill > Burst > Normal Attack |
| Support (Burst) | Burst > Skill > Normal Attack |
| Support (Skill) | Skill > Burst > Normal Attack |
| Healer | Burst > Skill > Normal Attack |

### Constellation Priority
- **C1**: Thường có giá trị cao (chỉ cần 1 duplicate)
- **C2**: Often major power spike
- **C3, C5**: Talent level +3 (tiết kiệm materials)
- **C4**: Thường buff mạnh
- **C6**: Ultimate form nhưng expensive

### Constellation Stopping Points
- **C0**: Viable cho F2P
- **C1**: Best value/cost ratio
- **C2**: Major improvement for many characters
- **C6**: Only for main team / favorite characters

---

## 5. Hệ Thống Progression

### Adventure Rank (AR)
- **AR 1-45**: Early game, farm rương
- **AR 45-55**: Mid game, farm artifacts
- **AR 55-60**: Endgame, optimize builds

### World Level
- **WL 0-1**: Tutorial areas
- **WL 2-3**: Early-mid game
- **WL 4-5**: Mid-endgame
- **WL 6-8**: Endgame
- **WL 9**: Current max (very hard enemies)

### Resin System
- **Original Resin**: 160 cap, hồi 1/8 phút
- **Fragile Resin**: Limited use, don't waste
- **Condensed Resin**: Can convert, max 5
- **Priority**: Character ascension > Weapon ascension > Talent books > Artifacts

### Primogem Sources
- **Daily Commissions**: 60/day
- **Battle Pass**: 680/month
- **Spiral Abyss**: 1800/month (full clear)
- **Events**: 1600-2000/version
- **Achievements**: One-time
- **Chests**: One-time
- **Livestream codes**: 300/3 codes (rare)

---

## 6. Team Building Strategy

### Team Archetypes
| Archetype | Mô Tả | Ví Dụ |
|----------|-------|--------|
| Mono-Element | Tất cả cùng nguyên tố | Mono-Pyro (Xiangling, Bennett, Kazuha, Xinyan) |
| Double-Element | 2 nguyên tố khác nhau | Vape (Hydro + Pyro) |
| Triple-Element | 3 nguyên tố | Hyperbloom (Dendro + Hydro + Electro) |
| Quad-Element | 4 nguyên tố khác nhau | TEC (Raiden National) |

### Role Distribution
- **Main DPS**: 1 character (primary damage dealer)
- **Sub DPS**: 1-2 characters (off-field damage)
- **Support**: 1-2 characters (buffs, shields, healing)

### ER Requirements (Energy Recharge)
| Role | Target ER% |
|-------|------------|
| Main DPS (Burst-swap) | 140-180% |
| Sub DPS (off-field) | 180-240% |
| Support (Burst) | 160-200% |
| Xingqiu | 220%+ |
| Raiden | 250%+ |

---

## 7. Spiral Abyss Strategy

### Floor Structure
- **Floors 1-8**: Early game, easy clears
- **Floors 9-12**: Mid game, requires decent builds
- **Floors 13-16**: Endgame, requires optimized builds

### Stars Required
- **36 stars**: Full Primogem reward (600)
- **9 stars per chamber**: 3 stars per half-chamber

### Meta Teams (2026)
- **Hyperbloom**: Nahida, Kokomi, Kuki, Xingqiu/Yelan
- **Rational Childe**: Childe, Xiangling, Bennett, Kazuha
- **Albedo National**: Albedo, Fischl, Xingqiu, Chongyun
- **Mono-Pyro**: Xiangling, Bennett, Kazuha, Xinyan
- **International**: Raiden, Xiangling, Bennett, Kazuha

---

## 8. Character Categories

### Rarity
- **5★**: 0.6% pity (90 pulls), 50/50 with banner
- **4★**: 13.33% pity (10 pulls), 50/50 with banner
- **3★**: 100% (weapons)

### Weapon Types
- **Sword**: Keqing, Ayaka, Bennett, Kaeya
- **Claymore**: Diluc, Razor, Noelle, Itto
- **Polearm**: Hu Tao, Xiao, Zhongli, Cyno
- **Bow**: Ganyu, Amber, Fischl, Venti
- **Catalyst**: Mona, Lisa, Klee, Ningguang

### Regions
- **Mondstadt**: Anemo, Cryo, Pyro
- **Liyue**: Geo, Pyro, Cryo, Electro
- **Inazuma**: Electro, Cryo, Anemo
- **Sumeru**: Dendro, Electro, Hydro
- **Fontaine**: Hydro, Pyro, Cryo
- **Natlan**: Pyro (new region)

---

## 9. Domain & Material Farming

### Domain Types
| Domain Type | Loot | Days |
|-------------|------|------|
| Domain of Forgery | Weapon Ascension Materials | Specific days |
| Domain of Relics | Artifacts | Any day |
| Domain of Blessing | Talent Books | Specific days |

### Talent Book Days
| Day | Books |
|-----|-------|
| Monday/Thursday | Resistance, Freedom, Ballad |
| Tuesday/Friday | Prosperity, Diligence, Gold |
| Wednesday/Saturday | Transience, Elegance, Light |
| Sunday | All |

### Weapon Material Days
| Day | Materials |
|-----|-----------|
| Monday/Thursday | Mondstadt, Liyue |
| Tuesday/Friday | Inazuma, Sumeru |
| Wednesday/Saturday | Fontaine, Natlan |
| Sunday | All |

---

## 10. Character Ascension Materials

### Ascension Phases
| Phase | Max Level | Materials Needed |
|-------|-----------|------------------|
| 1st | Lv. 40 | Local specialty + Boss drop + Talent book + Mora |
| 2nd | Lv. 50 | Same materials, higher quantity |
| 3rd | Lv. 60 | Same materials, higher quantity |
| 4th | Lv. 70 | Same materials, higher quantity |
| 5th | Lv. 80 | Same materials, higher quantity |
| 6th | Lv. 90 | Same materials, highest quantity |

### Material Types
- **Local Specialty**: Mondstadt/Liyue/Inazuma/Sumeru/Fontaine specialty
- **Boss Drop**: World Boss drops (e.g., Dvalin's Plume)
- **Weekly Boss**: Stormterror, Childe, La Signora, etc.
- **Talent Books**: From Domains of Blessing
- **Mora**: Currency for all upgrades

---

## 11. Advanced Mechanics

### Gauge Theory
- **1U**: Weak application (most Normal Attacks)
- **2U**: Medium application (Charged Attacks, some Skills)
- **3U**: Strong application (many Burst applications)
- **4U**: Very strong (rare)

### ICD (Internal Cooldown)
- **2.5s**: Standard ICD for most attacks
- **0s**: No ICD (e.g., Xingqiu Rain Swords)
- **1s**: Short ICD

### Snapshotting
- **Snapshot**: Lock stats when ability is cast
- **Non-snapshot**: Stats update dynamically
- **Characters with snapshot**: Childe (Melee), Fischl (Oz), Yelan (Burst)

### Cancel Animation
- **Jump Cancel**: Cancel animation with jump
- **Dash Cancel**: Cancel animation with dash
- **Weapon Swap**: Switch to cancel animation

---

## 12. Meta Changes (2026)

### Current Meta (Version 5.0+)
- **Dendro reactions**: Hyperbloom, Burgeon dominate
- **Fontaine characters**: High HP scalers (Neuvillette, Furina)
- **Stellar Glimmer**: New mechanic for certain characters
- **Natlan**: New region with Pyro focus

### Future Trends
- **More HP scalers**: Continue Fontaine trend
- **Dendro diversification**: More Dendro characters
- **Reaction optimization**: EM becomes more valuable
- **Energy economy**: ER requirements evolving

---

## Tài Liệu Tham Khảo

- **KeQingMains (KQM)**: Optimization guides
- **GenshinTactics**: Data-driven guides
- **Honey Impact**: Build database
- **Game8**: Japanese guides
- **Akasha.cv**: Build sharing platform

---

## Lưu Ý Cho LEIBO Wiki

### Cần Thêm
- [ ] Detailed character pages with talent priorities
- [ ] Artifact substat rolling guide
- [ ] Team composition builder
- [ ] Domain schedule with daily rotations
- [ ] Material calculator for ascension
- [ ] Spiral Abyss team recommendations
- [ ] Constellation value calculator

### Cần Cập Nhật
- [ ] New characters (Natlan)
- [ ] New artifact sets
- [ ] New weapons
- [ ] Meta changes
- [ ] Buff/nerf patches

---

*Document updated: 2026-09-20*
*Source: Web research from official guides and community resources*