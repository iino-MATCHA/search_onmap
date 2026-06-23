/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrefectureTravelData } from '../types';

export const PREFECTURES_BY_REGION: Record<string, PrefectureTravelData[]> = {
  'Hokkaido': [
    {
      id: 'hokkaido',
      nameJa: '北海道',
      nameEn: 'Hokkaido',
      region: 'Hokkaido',
      capital: 'Sapporo',
      description: 'Japan\'s northern wild frontier, featuring massive landscapes, flower fields, pristine national parks, and world-class winter resorts.',
      spots: [
        {
          name: 'Niseko Ski Resorts',
          description: 'Famous worldwide for its dry, fluffy powder snow and fantastic mountain views.',
          imageUrl: 'https://images.unsplash.com/photo-1549114706-381f215037a2?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Furano Lavender Fields',
          description: 'Stunning violet rolling fields blooming beautifully in mid-late July.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Sapporo Miso Ramen', 'Genghis Khan (Grilled Mutton)', 'Fresh King Crab', 'Hokkaido Dairy Soft Serve'],
      tips: 'Rent a car to explore the majestic, national parks of Daisetsuzan or Shiretoko at your own pace.'
    }
  ],
  'Tohoku': [
    {
      id: 'aomori',
      nameJa: '青森県',
      nameEn: 'Aomori',
      region: 'Tohoku',
      capital: 'Aomori',
      description: 'Home to the magnificent Nebuta festival, lush apple orchards, and the mystic, ancient beech forests of Shirakami Sanchi.',
      spots: [
        {
          name: 'Oirase Mountain Stream',
          description: 'A breathtakingly picturesque freshwater gorge filled with stunning moss-covered rocks and waterfalls.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Hirosaki Castle',
          description: 'Renowned as one of Japan\'s most magnificent cherry blossom viewing spots with over 2,500 trees.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Aomori Apples', 'Senbei Jiru (Rice Cracker Soup)', 'Nokke-don (Custom Seafood Bowl)', 'Scallops'],
      tips: 'Visit in early August to experience the Nebuta Matsuri where giant paper floats light up the warm nights.'
    },
    {
      id: 'iwate',
      nameJa: '岩手県',
      nameEn: 'Iwate',
      region: 'Tohoku',
      capital: 'Morioka',
      description: 'The second largest prefecture in Japan, combining stunning rugged coastlines, sacred temples, and timeless folklore.',
      spots: [
         {
           name: 'Chuson-ji Temple (Hiraizumi)',
           description: 'A stunning Buddhist complex with the spectacular Konjikido golden hall.',
           imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
         }
      ],
      foods: ['Wanko Soba (Unlimited bite-size noodles)', 'Morioka Reimen', 'Morioka Jajamen'],
      tips: 'Try the Wanko Soba challenge – locals often eat more than 100 small bowls in one seating!'
    },
    {
      id: 'miyagi',
      nameJa: '宮城県',
      nameEn: 'Miyagi',
      region: 'Tohoku',
      capital: 'Sendai',
      description: 'Historical seat of the Date clan, blending beautiful city groves with Matsushima Bay, celebrated as one of Japan\'s best views.',
      spots: [
        {
          name: 'Matsushima Islands',
          description: 'A gorgeous bay dotted with over 260 pine-clad tiny sandstone islets.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Gyutan (Grilled Beef Tongue)', 'Zunda Mochi (Sweet Edamame Paste)', 'Shiogama Sushi'],
      tips: 'Sendai is nicknamed the "City of Trees." Enjoy a stroll along the keyaki-lined Jozenji Avenue.'
    },
    {
      id: 'akita',
      nameJa: '秋田県',
      nameEn: 'Akita',
      region: 'Tohoku',
      capital: 'Akita',
      description: 'Renowned for stunning natural beauty, healing hot springs, Akita dogs, high-quality sake, and historical samurai districts.',
      spots: [
        {
          name: 'Kakunodate Samurai District',
          description: 'Exquisitely preserved black-walled samurai residences and weeping cherry trees.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kiritampo (Toasted Rice Skewers)', 'Hata-hata Fish', 'Inaniwa Udon'],
      tips: 'Relax in Nyuto Onsen, a collection of rustic, hot spring baths hidden deep in the forested hills.'
    },
    {
      id: 'yamagata',
      nameJa: '山形県',
      nameEn: 'Yamagata',
      region: 'Tohoku',
      capital: 'Yamagata',
      description: 'A magical realm of mountain temples, sacred peaks, hot springs, and delicious sweet cherries.',
      spots: [
        {
          name: 'Yamadera Temple',
          description: 'A gorgeous mountain temple built into steep rock walls, offering inspiring valley views.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Imoni (Taro & Beef Stew)', 'Sato Nishiki Cherries', 'Yonezawa Beef'],
      tips: 'Visit Ginzan Onsen in the winter to see historical wooden inns glowing warm under gas lamps and snow.'
    },
    {
      id: 'fukushima',
      nameJa: '福島県',
      nameEn: 'Fukushima',
      region: 'Tohoku',
      capital: 'Fukushima',
      description: 'A picturesque territory of volcanic lakes, historical samurai towns, and cherry castles.',
      spots: [
        {
          name: 'Tsuruga Castle (Aizu)',
          description: 'A striking samurai fortress featuring unique red-tiled roofs and sweeping gardens.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kitakata Ramen', 'Peach Sweet Fruits', 'Aizu Horsemeat Sashimi'],
      tips: 'Drink pure, award-winning Fukushima sake, voted Japan\'s finest for several consecutive years.'
    }
  ],
  'Kanto': [
    {
      id: 'tokyo',
      nameJa: '東京都',
      nameEn: 'Tokyo',
      region: 'Kanto',
      capital: 'Tokyo',
      description: 'The spectacular capital of Japan, seamlessly combining ultra-dense neon skyscrapers, futuristic tech, and ancient shrines.',
      spots: [
        {
          name: 'Shibuya Crossing',
          description: 'The world\'s most famous, hyper-kinetic intersection where up to 3,000 cross at once.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Senso-ji (Asakusa)',
          description: 'Tokyo\'s oldest and most iconic Buddhist temple, entered through the mighty Kaminarimon gate.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Modern Edomae Sushi', 'Monjayaki', 'Tokyo Shoyu Ramen', 'Tempura'],
      tips: 'Purchase a Suica card for seamless touch-and-go travel on the Yamanote subway line.'
    },
    {
      id: 'kanagawa',
      nameJa: '神奈川県',
      nameEn: 'Kanagawa',
      region: 'Kanto',
      capital: 'Yokohama',
      description: 'Coastal gem featuring the historic temples of Kamakura, Yokohama Chinatown, and Mount Fuji views from Hakone.',
      spots: [
        {
          name: 'Hakone Hot Springs',
          description: 'Scenic mountainous resort town with pure volcanic baths and cruising on Lake Ashi.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Yokohama Iekei Ramen', 'Kamakura Shirasu (Silver Anchovy)', 'Hakone Black Eggs (Kuro-Tamago)'],
      tips: 'Take the romantic Hakone Tozan Railway through the lush valleys for a visual treat.'
    },
    {
      id: 'chiba',
      nameJa: '千葉県',
      nameEn: 'Chiba',
      region: 'Kanto',
      capital: 'Chiba',
      description: 'The gateway to Japan, hosting Narita Airport, the dramatic Boso Peninsula coast, and Tokyo Disney Resort.',
      spots: [
        {
          name: 'Narita-san Shinshoji Temple',
          description: 'A spectacular, sprawling temple offering a beautiful glimpse into Japanese faith near the airport.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Boso Seafood', 'Chiba Peanuts', 'White Gyoza'],
      tips: 'Allow an extra half-day to explore Naritamachi\'s historic wooden street before your departure flight.'
    },
    {
      id: 'saitama',
      nameJa: '埼玉県',
      nameEn: 'Saitama',
      region: 'Kanto',
      capital: 'Saitama',
      description: 'Discover "Little Edo" in historic Kawagoe, natural river views in Nagatoro, and contemporary cycling trails.',
      spots: [
        {
          name: 'Kawagoe Clay Warehouse District',
          description: 'Take a trip back to the Edo Period with old bell towers and sweet potato candy stores.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Chichibu Soba', 'Sweet Potato Desserts', 'Soka Senbei rice crackers'],
      tips: 'Rent a bicycle to explore the pristine river bends and majestic shrine gates of Nagatoro.'
    },
    {
      id: 'tochigi',
      nameJa: '栃木県',
      nameEn: 'Tochigi',
      region: 'Kanto',
      capital: 'Utsunomiya',
      description: 'A land of rich spirituality, holding the gilded structures of Nikko and the gourmet pan-fried gyoza of Utsunomiya.',
      spots: [
        {
          name: 'Nikko Toshogu Shrine',
          description: 'The breathtakingly ornate final resting place of Shogun Tokugawa Ieyasu amidst giant cedars.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Utsunomiya Gyoza', 'Yuba (Bean Curd Skins)', 'Tochigi Tochiotome Strawberries'],
      tips: 'Nikko is extremely close to Tokyo and makes for a beautiful day trip or weekend escape.'
    },
    {
      id: 'gunma',
      nameJa: '群馬県',
      nameEn: 'Gunma',
      region: 'Kanto',
      capital: 'Maebashi',
      description: 'One of Japan\'s premier onsen kingdoms, offering cascading natural bath springs and dramatic volcanic peak paths.',
      spots: [
        {
          name: 'Kusatsu Onsen Yubatake',
          description: 'The iconic wooden "hot water field" fields that cool down piping hot healing spring water.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Yaki-Manju (Sweet Miso buns)', 'Mizusawa Udon', 'Shimonita Konnyaku'],
      tips: 'Watch the traditional "Yumomi" performance, where local ladies paddle song-guided thermal waters.'
    },
    {
      id: 'ibaraki',
      nameJa: '茨城県',
      nameEn: 'Ibaraki',
      region: 'Kanto',
      capital: 'Mito',
      description: 'A coastal beauty celebrating Mito\'s Kairakuen Garden, massive seasonal flower meadows, and sacred shrines.',
      spots: [
        {
          name: 'Hitachi Seaside Park',
          description: 'Famous globally for rolling plains of blue nemophilas in spring and red kochia bushes in autumn.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Mito Natto (Fermented Soybeans)', 'Anko (Monkfish) Hotpot', 'Sweet Potatoes'],
      tips: 'Visit Mito Kairakuen in February/March to experience thousands of blooming plum trees.'
    }
  ],
  'Chubu': [
    {
      id: 'yamanashi',
      nameJa: '山梨県',
      nameEn: 'Yamanashi',
      region: 'Chubu',
      capital: 'Kofu',
      description: 'Home to the magnificent northern half of Mt. Fuji, the breathtaking Fuji Five Lakes, and Japan\'s finest vineyards.',
      spots: [
        {
          name: 'Chureito Pagoda',
          description: 'The quintessential view of Japan: a majestic red pagoda framing Mount Fuji in the background.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Hoto Noodles (Thick pumpkin stew)', 'Kofu Torimotsu-ni', 'Grape & Peach fruit harvest'],
      tips: 'Take the Fuji Excursion train directly from Shinjuku for instant access to Lake Kawaguchiko.'
    },
    {
      id: 'shizuoka',
      nameJa: '静岡県',
      nameEn: 'Shizuoka',
      region: 'Chubu',
      capital: 'Shizuoka',
      description: 'Where green tea meets green mountain ridges, hosting the classic views of Mt. Fuji and the scenic Izu Peninsula.',
      spots: [
        {
          name: 'Nihondaira Plateau',
          description: 'Breathtaking panoramic viewpoints over Suruga Bay facing the splendid Mt. Fuji.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Shizuoka Green Tea', 'Wasabi stem salad', 'Shizuoka Oden', 'Sakura Shrimp'],
      tips: 'Buy genuine, freshly grated Shizuoka wasabi to enjoy with high-grade local sashimi.'
    },
    {
      id: 'aichi',
      nameJa: '愛知県',
      nameEn: 'Aichi',
      region: 'Chubu',
      capital: 'Nagoya',
      description: 'The industrial power center with a legendary samurai lineage, home to Nagoya Castle and innovative local cuisine.',
      spots: [
        {
          name: 'Nagoya Castle',
          description: 'Topped with majestic gold-plated shachihoko (mythical dolphin-headed tigers).',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Hitsumabushi (Premium Grilled Eel)', 'Miso Katsu', 'Tebasaki Chicken Wings'],
      tips: 'Visit the Ghibli Park located in Nagakute for an immersive descent into Miyazaki\'s films.'
    },
    {
      id: 'nagano',
      nameJa: '長野県',
      nameEn: 'Nagano',
      region: 'Chubu',
      capital: 'Nagano',
      description: 'The spectacular rooftop of Japan, home to the Northern Alps, winter ski trails, and hot-spring taking snow monkeys.',
      spots: [
        {
          name: 'Jigokudani Monkey Park',
          description: 'A magical forest spot where Japanese macaques soak in outdoor hot springs during winter.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Shinshu Soba', 'Oyaki Dumplings', 'Apple cider tarts'],
      tips: 'Hike a portion of the old Nakasendo highway between the legendary post towns Tsumago and Magome.'
    },
    {
      id: 'gifu',
      nameJa: '岐阜県',
      nameEn: 'Gifu',
      region: 'Chubu',
      capital: 'Gifu',
      description: 'TIMELess rural beauty, featuring the thatched gassho-zukuri wood cabins of Shirakawa-go and historic Takayama.',
      spots: [
        {
          name: 'Shirakawa-go Village',
          description: 'A lovely, fairytale UNESCO village surrounded by pine mountains and rice fields.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Hida Beef', 'Keichan chicken', 'Gohei Mochi'],
      tips: 'Explore Takayama\'s morning markets and wooden merchant houses for exquisite hand-painted crafts.'
    },
    {
      id: 'niigata',
      nameJa: '新潟県',
      nameEn: 'Niigata',
      region: 'Chubu',
      capital: 'Niigata',
      description: 'Famous as Japan\'s premier snow country, brewing crisp, dry sake and harvesting the best Koshihikari rice.',
      spots: [
        {
          name: 'Echigo Yuzawa Onsen',
          description: 'Top-tier skiing and relaxing, volcanic spring houses accessible instantly via bullet train.',
          imageUrl: 'https://images.unsplash.com/photo-1549114706-381f215037a2?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Koshihikari Rice bento', 'Niigata Craft Sake', 'Hegi Soba'],
      tips: 'Check out the Ponshukan inside Echigo-Yuzawa station to taste samples of 100+ local sakes from vending dispensers.'
    },
    {
      id: 'toyama',
      nameJa: '富山県',
      nameEn: 'Toyama',
      region: 'Chubu',
      capital: 'Toyama',
      description: 'Blending alpine heights with deep ocean water treasures, featuring firefly squid and grand peaks.',
      spots: [
        {
          name: 'Tateyama Kurobe Alpine Route',
          description: 'The monumental mountain pass containing giant snow walls towering up to 20 meters high.',
          imageUrl: 'https://images.unsplash.com/photo-1549114706-381f215037a2?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Toyama Black Ramen', 'Firefly Squid', 'White Shrimp Sushi'],
      tips: 'The snow corridor is normally open to hikers between mid-April and late June.'
    },
    {
      id: 'ishikawa',
      nameJa: '石川県',
      nameEn: 'Ishikawa',
      region: 'Chubu',
      capital: 'Kanazawa',
      description: 'Immense castle culture, home to Kanazawa\'s preserved geisha streets, Kenrokuen Garden, and gorgeous gold leaf.',
      spots: [
        {
          name: 'Kenrokuen Garden',
          description: 'Universally celebrated as one of Japan\'s "Three Great Gardens," showing stunning winter rope configurations.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Noto Beef', 'Kaga Jibuni chicken stew', 'Kanazawa Curry', 'Snow Crab'],
      tips: 'Try a gold-leaf wrapped soft serve cone in Kanazawa\'s preserved Higashi Chaya district.'
    },
    {
      id: 'fukui',
      nameJa: '福井県',
      nameEn: 'Fukui',
      region: 'Chubu',
      capital: 'Fukui',
      description: 'A mysterious land holding dinosaur fossils, Zen Buddhist Monasteries, and steep basalt ocean cliffs.',
      spots: [
        {
          name: 'Eihei-ji Temple',
          description: 'The world-famous "Temple of Eternal Peace," an active school founded in 1244.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Echizen Oroshi Soba', 'Echizen Crab', 'Sauce Katsudon'],
      tips: 'Visit the architectural marvel that is the Fukui Prefectural Dinosaur Museum.'
    }
  ],
  'Kansai': [
    {
      id: 'kyoto',
      nameJa: '京都府',
      nameEn: 'Kyoto',
      region: 'Kansai',
      capital: 'Kyoto',
      description: 'The cultural soul of Japan with thousands of classic wooden temples, traditional geishas, and majestic shrines.',
      spots: [
        {
          name: 'Fushimi Inari Shrine',
          description: 'An inspiring path of over 10,000 brilliant vermilion torii gates winds up the sacred mountain.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Kinkaku-ji (Golden Pavilion)',
          description: 'A legendary Zen temple completely covered in brilliant gold leaf, reflecting on a mirror-like pond.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kyoto Matchas', 'Yudofu (Silken tofu stew)', 'Kaiseki Ryori', 'Yatsuhashi (Cinnamon rice-flour triangles)'],
      tips: 'Wander Asaka or Gion early in the morning to enjoy Kyoto\'s silent wooden streets without the crowds.'
    },
    {
      id: 'osaka',
      nameJa: '大阪府',
      nameEn: 'Osaka',
      region: 'Kansai',
      capital: 'Osaka',
      description: 'The nation\'s street food kitchen, known for friendly locals, blazing neon signs, and endless food alleys.',
      spots: [
        {
          name: 'Dotonbori district',
          description: 'An explosive neon canal lined with giant animatronic food signs and the Glico Running Man.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Osaka Castle',
          description: 'The grand castle in the middle of a massive green park, housing historical artifacts.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Takoyaki (Octopus Balls)', 'Okonomiyaki (Savory Cabbage Pancake)', 'Kushikatsu (Skewered Fried Meats)'],
      tips: 'The local motto is "Kuidaore" – eat until you drop. Don\'t hold back in the local izakayas!'
    },
    {
      id: 'nara',
      nameJa: '奈良県',
      nameEn: 'Nara',
      region: 'Kansai',
      capital: 'Nara',
      description: 'Ancient first capital home to massive free-roaming sacred deer and some of Japan\'s largest wooden temples.',
      spots: [
        {
          name: 'Todai-ji Temple',
          description: 'An immense wooden structure hosting Japan\'s breathtaking 15-meter tall bronze Great Buddha.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kaki no Ha Sushi (Sushi wrapped in Persimmon leaf)', 'Miwa Somen', 'Yamato Tea'],
      tips: 'Buy "Shika-senbei" biscuits in the park to feed the bowing deer, but be ready for them to crowd you!'
    },
    {
      id: 'hyogo',
      nameJa: '兵庫県',
      nameEn: 'Hyogo',
      region: 'Kansai',
      capital: 'Kobe',
      description: 'Home to the magnificent White Heron Castle in Himeji and the world-renowned gourmet Kobe beef.',
      spots: [
        {
          name: 'Himeji Castle',
          description: 'Japan\'s most breathtakingly preserved samurai castle, shining brilliant white like a flying heron.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kobe Beef Teppanyaki', 'Akashiyaki (Egg-rich octopus dumplings)', 'Nada Sake'],
      tips: 'Visit Mount Rokko at sunset to catch the celebrated "10-million-dollar night view" of Kobe Port.'
    },
    {
      id: 'shiga',
      nameJa: '滋賀県',
      nameEn: 'Shiga',
      region: 'Kansai',
      capital: 'Otsu',
      description: 'Surrounding Lake Biwa, Japan\'s largest lake, offering sailing, water gates, and prime castle towns.',
      spots: [
        {
          name: 'Hikone Castle',
          description: 'One of the rare original surviving medieval castles, overlooking the glittering Lake Biwa.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Omi Beef', 'Funazushi (Ancient fermented sushi)', 'Biwa trout'],
      tips: 'Rent a rental bicycle and complete the scenic "Biwaichi" loop trail around the natural shoreline.'
    },
    {
      id: 'wakayama',
      nameJa: '和歌山県',
      nameEn: 'Wakayama',
      region: 'Kansai',
      capital: 'Wakayama',
      description: 'Deep sacred ancient forests, home to the sacred trails of Kumano Kodo and deep temple stays on Mt. Koya.',
      spots: [
        {
          name: 'Nachi Falls & Pagoda',
          description: 'The stunning vermilion complex standing beautifully next to Japan\'s tallest single-drop waterfall.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Wakayama Ramen', 'Kishu Nanko Umeboshi (Sour Plum)', 'Fresh Tuna from Katsuura'],
      tips: 'Book a temple stay (shukubo) on Mount Koya to eat vegetarian monk food and attend morning prayers.'
    },
    {
      id: 'mie',
      nameJa: '三重県',
      nameEn: 'Mie',
      region: 'Kansai',
      capital: 'Tsu',
      description: 'Holding the ultra-sacred spiritual center of the Ise Grand Shrine, alongside historical female pearl divers.',
      spots: [
        {
          name: 'Ise Jingu Shrine',
          description: 'The absolute spiritual heart of Shinto, reconstructed every 20 years to symbolize purity.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Matsusaka Beef', 'Ise Udon (Thick, soft noodles)', 'Spiny Lobster'],
      tips: 'Walk the bustling historic streets of Okage Yokocho right outside Ise Jingu to try local snacks.'
    }
  ],
  'Chugoku': [
    {
      id: 'hiroshima',
      nameJa: '広島県',
      nameEn: 'Hiroshima',
      region: 'Chugoku',
      capital: 'Hiroshima',
      description: 'A monument of historical peace alongside the iconic floating torii gate of Miyajima.',
      spots: [
        {
          name: 'Miyajima Floating Torii Gate',
          description: 'The monumental orange gateway of Itsukushima Shrine that appears to float magically at high tide.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Peace Memorial Park',
          description: 'A moving, serene green dedicated to hope, featuring the iconic Atomic Bomb Dome.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Hiroshima Style Okonomiyaki', 'Grilled fresh oysters', 'Momiji Manju (Maple leaf sweet cakes)'],
      tips: 'Rent a bicycle to explore the Shimanami Kaido, cycling over gorgeous suspension bridges across islands.'
    },
    {
      id: 'okayama',
      nameJa: '岡山県',
      nameEn: 'Okayama',
      region: 'Chugoku',
      capital: 'Okayama',
      description: 'Affectionately known as the "Land of Sunshine," holding the Kurashiki canal city and delicious white peaches.',
      spots: [
        {
          name: 'Kurashiki Bikan Historical Area',
          description: 'A beautiful canal merchant town lined with white-walled stone warehouses.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Okayama Barazushi', 'Kibi Dango', 'Shimizu White Peaches'],
      tips: 'Try renting a traditional wooden boat to go down the willow-lined Kurashiki canals.'
    },
    {
      id: 'shimane',
      nameJa: '島根県',
      nameEn: 'Shimane',
      region: 'Chugoku',
      capital: 'Matsue',
      description: 'The cradle of Japanese creation myths, containing Izumo Taisha, one of the country\'s oldest sacred shrines.',
      spots: [
        {
          name: 'Izumo Taisha Grand Shrine',
          description: 'Dedicated to relationships and marriage, hosting stunning giant straw sacred ropes.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Izumo Soba', 'Shijimi Clam Soup', 'Matsue Green Tea sweets'],
      tips: 'Visit the Adachi Museum of Art, famous for gardens ranked #1 in Japan for twenty consecutive years.'
    },
    {
      id: 'tottori',
      nameJa: '鳥取県',
      nameEn: 'Tottori',
      region: 'Chugoku',
      capital: 'Tottori',
      description: 'Host to dramatic coastal sights, holding Japan\'s massive rolling oceanside sand dunes.',
      spots: [
        {
          name: 'Tottori Sand Dunes',
          description: 'A striking 16km stretch of golden wind-rippled sand borders along the Sea of Japan.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Matsuba Crab', 'Tottori Nijisseiki Pear', 'Gyukotsu (Beef bone) Ramen'],
      tips: 'Ride a local camel across the dunes at sunset for unforgettable, desert-style photos.'
    },
    {
      id: 'yamaguchi',
      nameJa: '山口県',
      nameEn: 'Yamaguchi',
      region: 'Chugoku',
      capital: 'Yamaguchi',
      description: 'Stunning bridge arches and marine gates, featuring the Motonosumi Shrine cliffside torii gates.',
      spots: [
        {
          name: 'Motonosumi Shrine',
          description: 'An awesome series of 123 vermilion torii gates stretching along ocean spray cliff rocks.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Sashimi Fugu (Blowfish)', 'Kawara Soba (Noodles on roof tiles)', 'Iwakuni Sushi'],
      tips: 'Cross the gorgeous Kintai Bridge, a magnificent 5-arched historic wooden bridge spanning the Nishiki River.'
    }
  ],
  'Shikoku': [
    {
      id: 'tokushima',
      nameJa: '徳島県',
      nameEn: 'Tokushima',
      region: 'Shikoku',
      capital: 'Tokushima',
      description: 'Home of the energetic Awa Odori dance matsuri, deep indigo dye houses, and the swirling Naruto whirlpools.',
      spots: [
        {
          name: 'Naruto Whirlpools',
          description: 'Unbelievable tidal whirlpools that churn dramatically under the Great Naruto suspension Bridge.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Tokushima Ramen (Sweet pork bone syrup)', 'Sudachi Citruses', 'Awa Odori Chicken'],
      tips: 'Visit in mid-August to experience Awa Odori, the largest, most spectacular dance festival in Japan.'
    },
    {
      id: 'kagawa',
      nameJa: '香川県',
      nameEn: 'Kagawa',
      region: 'Shikoku',
      capital: 'Takamatsu',
      description: 'Japan\'s "Udon Prefecture," hosting classic Ritsurin Garden and the art islands of Naoshima.',
      spots: [
        {
          name: 'Naoshima Art Island',
          description: 'A scenic world-class contemporary art island featuring Yayoi Kusama\'s iconic pumpkins.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Sanuki Udon (Chewy wheat noodles)', 'Honetsuki-dori (Seasoned chicken on the bone)'],
      tips: 'Rent a bicycle to tour the outdoor installations and underground museums of Naoshima.'
    },
    {
      id: 'ehime',
      nameJa: '愛媛県',
      nameEn: 'Ehime',
      region: 'Shikoku',
      capital: 'Matsuyama',
      description: 'Unveiling Dogo Onsen (one of Japan\'s oldest baths), historical mountain fortresses, and juicy Mandarins.',
      spots: [
        {
          name: 'Dogo Onsen Honkan',
          description: 'The whimsical historic bathhouse that heavily inspired Hayao Miyazaki\'s Spirited Away.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Mikan Mandarins', 'Taimeshi (Sea Bream cooked with rice)'],
      tips: 'Cycle the Shimanami Kaido, starting from Imabari to traverse the Seto Inland Sea islands.'
    },
    {
      id: 'kochi',
      nameJa: '高知県',
      nameEn: 'Kochi',
      region: 'Shikoku',
      capital: 'Kochi',
      description: 'Vast nature landscapes, holding the pristine Shimanto River, historic hills, and dynamic local food markets.',
      spots: [
        {
          name: 'Shimanto River',
          description: 'Hailed as Japan\'s "last crystal-clear river," flowing without any concrete storage dam.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Katsuo no Tataki (Seared Bonito fish)', 'Tosa Tofu', 'Yuzu juices'],
      tips: 'Visit Hirome Market in Kochi City to try seared bonito freshly prepared over burning straw.'
    }
  ],
  'Kyushu & Okinawa': [
    {
      id: 'fukuoka',
      nameJa: '福岡県',
      nameEn: 'Fukuoka',
      region: 'Kyushu',
      capital: 'Fukuoka',
      description: 'The energetic gateway to Kyushu, celebrated globally for dynamic Hakata Tonkotsu ramen and open-air food stalls (Yatai).',
      spots: [
        {
          name: 'Nakasu Yatai Food Stalls',
          description: 'Cozy and social open-air riverfront food stalls serving delicious ramen, skewers, and sake.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Dazaifu Tenmangu Shrine',
          description: 'A great historic shrine dedicated to academic success, surrounded by 6,000 plum trees.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Hakata Tonkotsu Ramen', 'Motsunabe (Intestine hotpot)', 'Karashi Mentaiko (Spicy Cod Roe)'],
      tips: 'Squeeze into a riverfront Yatai stall around Nakasu; it\'s the best way to chat with local residents!'
    },
    {
      id: 'okinawa',
      nameJa: '沖縄県',
      nameEn: 'Okinawa',
      region: 'Okinawa',
      capital: 'Naha',
      description: 'Japan\'s southern tropical paradise, home to the Ryukyu Kingdom ruins, white-sand beaches, and crystal waters.',
      spots: [
        {
          name: 'Churaumi Aquarium',
          description: 'A spectacular world-class aquarium containing a massive tank with whale sharks and manta rays.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Kabira Bay (Ishigaki Island)',
          description: 'A stunning tropical emerald-green bay dotted with white sand, coral reefs, and green islands.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Okinawa Soba', 'Goya Chanpuru (Bitter melon stir-fry)', 'Taco Rice', 'Rafute (Thick glased pork belly)'],
      tips: 'Rent a rental car or cycle on small outer islands like Taketomi to enjoy Okinawa\'s sand-paved villages.'
    },
    {
      id: 'saga',
      nameJa: '佐賀県',
      nameEn: 'Saga',
      region: 'Kyushu',
      capital: 'Saga',
      description: 'Preserving legendary porcelain crafts in Arita and Imari, accompanied by historical balloon flights.',
      spots: [
        {
          name: 'Arita Porcelain Village',
          description: 'The historic birthplace of Japanese porcelain, decorated with pottery pieces and workshops.',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Saga Beef', 'Yobuko Squid', 'Ureshino Onsen Yudofu'],
      tips: 'Explore Ureshino Onsen, loved for its warm water properties that skin feels silky soft after bathing.'
    },
    {
      id: 'nagasaki',
      nameJa: '長崎県',
      nameEn: 'Nagasaki',
      region: 'Kyushu',
      capital: 'Nagasaki',
      description: 'An exotic seaport blending Japanese, Chinese, and European history in its churches, slopes, and canals.',
      spots: [
        {
          name: 'Glover Garden',
          description: 'Preserved western mansions overlooking the scenic, deep blue Nagasaki bay.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Champon Noodles', 'Castella Sponge Cake', 'Sasebo Burgers'],
      tips: 'Take the Mt. Inasa cable car for one of Japan\'s best night harbor views, glittering like jewels.'
    },
    {
      id: 'kumamoto',
      nameJa: '熊本県',
      nameEn: 'Kumamoto',
      region: 'Kyushu',
      capital: 'Kumamoto',
      description: 'The country\'s active core, home to the sprawling volcanic caldera of Mt. Aso and the majestic Kumamoto Castle.',
      spots: [
        {
          name: 'Kumamoto Castle',
          description: 'The massive black-timber fortress, featuring formidable sloping rock stone defenses.',
          imageUrl: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kumamoto Ramen (Garlic-infused)', 'Basashi (Horsemeat)', 'Ikinari Dango'],
      tips: 'Drive to Kusasenri on Mount Aso to see horses gazing in a giant, green dormant volcanic crater.'
    },
    {
      id: 'oita',
      nameJa: '大分県',
      nameEn: 'Oita',
      region: 'Kyushu',
      capital: 'Oita',
      description: 'The hot spring capital of Japan, home to Beppu\'s spectacular of geyser pools and peaceful Yufuin.',
      spots: [
        {
          name: 'Beppu Hells (Jigoku Core)',
          description: 'A set of colorful natural steam pools ranging from bubbling blue mud to boiling blood red.',
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Toriten (Chicken Tempura)', 'Sekiaji & Sekisaba Mackerel', 'Kabosu citrus juice'],
      tips: 'Visit steam houses in Beppu where you cook vegetables and seafood by yourself over natural steam.'
    },
    {
      id: 'miyazaki',
      nameJa: '宮崎県',
      nameEn: 'Miyazaki',
      region: 'Kyushu',
      capital: 'Miyazaki',
      description: 'A beautiful coastal retreat featuring deep basalt gorges, rolling pacific waves, and sweet tropical fruits.',
      spots: [
        {
          name: 'Takachiho Gorge',
          description: 'A breathtakingly narrow chasm flanked by towering basalt columns. Rent a rowboat for the best view.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Miyazaki Mangoes', 'Chicken Nanban (Fried chicken with sweet tartare sauce)', 'Miyazaki Beef'],
      tips: 'Row a boat down the gorge to feel the mist of Manai Falls directly on your face.'
    },
    {
      id: 'kagoshima',
      nameJa: '鹿児島県',
      nameEn: 'Kagoshima',
      region: 'Kyushu',
      capital: 'Kagoshima',
      description: 'Dominated by the active Sakurajima volcano steaming over Kagoshima Bay, alongside ancient cedar forests in Yakushima.',
      spots: [
        {
          name: 'Sakurajima Active Volcano',
          description: 'The majestic active volcano rising directly from the bay, puffing smoke clouds throughout the day.',
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
        }
      ],
      foods: ['Kurobuta Pork Shabu-Shabu', 'Satsuma-age (Fried fish cake)', 'Shirokuma (Bear-shaped shaved ice)'],
      tips: 'Take the ferry to Sakurajima for a relaxing footbath heated by natural volcanic springs.'
    }
  ]
};

export const ALL_PREFECTURES: PrefectureTravelData[] = Object.values(PREFECTURES_BY_REGION).flat();

export function getPrefectureById(id: string): PrefectureTravelData | undefined {
  return ALL_PREFECTURES.find(pref => pref.id.toLowerCase() === id.toLowerCase());
}
