-- ============================================================
-- TENNIS POINT — Seed do Torneio 2026 (adaptado pro schema existente)
-- Pré-requisitos:
--   - tabelas profiles, tournaments, categories, brackets já existem
--   - trigger on_auth_user_created já está ativo
--   - 155 profiles já criados (153 tennispointt.com.br + 2 do Johnatan)
-- Idempotente: ON CONFLICT/WHERE NOT EXISTS em todos os steps.
-- Sem BEGIN/COMMIT (rodado via execute_sql).
-- ============================================================

-- 1) Marca johnatan@tennispointt.com.br como admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'johnatan@tennispointt.com.br' AND role <> 'admin';

-- 2) Cria categorias faltantes (cat-a e cat-c). cat-5a e cat-5b já existem.
INSERT INTO public.categories (id, name, icon, order_index) VALUES
  ('cat-a', 'Cat. A', '🥇', 0),
  ('cat-c', 'Cat. C', '🎾', 7)
ON CONFLICT (id) DO NOTHING;

-- 3) Cria tournament 'Torneio Tênis Point 2026' se não existir (idempotente por nome)
INSERT INTO public.tournaments (name, status, start_date, end_date)
SELECT 'Torneio Tênis Point 2026', 'active', '2026-04-01'::date, '2026-06-30'::date
WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Torneio Tênis Point 2026');

-- 4) Insere os 4 brackets (cat-a, cat-5a, cat-5b, cat-c) com data JSONB completo.
-- Cada data contém: rounds, matches (com p1/p2/winner/scores/isBye), entries (id/name/accountEmails),
-- drawn=true, publishedAt. Idempotente via WHERE NOT EXISTS.

-- 4.cat-a
WITH t AS (SELECT id FROM public.tournaments WHERE name = 'Torneio Tênis Point 2026' LIMIT 1)
INSERT INTO public.brackets (tournament_id, category_id, drawn, data)
SELECT t.id, 'cat-a', true, $JSON$
{
  "rounds": [
    "R32",
    "R16",
    "QF",
    "SF",
    "F"
  ],
  "matches": {
    "R32": [
      {
        "id": "m-r32-1",
        "n": 1,
        "round": "R32",
        "p1": "tp26-a-ian",
        "p2": "tp26-a-rebol-mb",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-2",
        "n": 2,
        "round": "R32",
        "p1": "tp26-a-paulao",
        "p2": "tp26-a-pan",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-3",
        "n": 3,
        "round": "R32",
        "p1": "tp26-a-fabinho",
        "p2": "tp26-a-joao-rossi",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-4",
        "n": 4,
        "round": "R32",
        "p1": "tp26-a-fcarvoli",
        "p2": "tp26-a-brunno-c",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-5",
        "n": 5,
        "round": "R32",
        "p1": "tp26-a-marcelo-r",
        "p2": "tp26-a-panda",
        "scores": [
          [
            3,
            6
          ],
          [
            6,
            0
          ],
          [
            11,
            9
          ]
        ],
        "winner": "tp26-a-panda",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-6",
        "n": 6,
        "round": "R32",
        "p1": "tp26-a-breno",
        "p2": "tp26-a-tammaro",
        "scores": [
          [
            2,
            6
          ],
          [
            6,
            1
          ],
          [
            10,
            2
          ]
        ],
        "winner": "tp26-a-tammaro",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-7",
        "n": 7,
        "round": "R32",
        "p1": "tp26-a-lucas-n",
        "p2": "tp26-a-thais",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-8",
        "n": 8,
        "round": "R32",
        "p1": "tp26-a-sandro-h",
        "p2": "tp26-a-sandro",
        "scores": [
          [
            6,
            0
          ],
          [
            6,
            1
          ]
        ],
        "winner": "tp26-a-sandro",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-9",
        "n": 9,
        "round": "R32",
        "p1": "tp26-a-fabio-i",
        "p2": "tp26-a-cristian",
        "scores": [
          [
            6,
            1
          ],
          [
            4,
            6
          ],
          [
            11,
            9
          ]
        ],
        "winner": "tp26-a-cristian",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-10",
        "n": 10,
        "round": "R32",
        "p1": "tp26-a-edu-cap",
        "p2": "tp26-a-felipe-c",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-11",
        "n": 11,
        "round": "R32",
        "p1": "tp26-a-magno",
        "p2": "tp26-a-luciano-ub",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-12",
        "n": 12,
        "round": "R32",
        "p1": "tp26-a-m-caldera",
        "p2": "tp26-a-martin",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-13",
        "n": 13,
        "round": "R32",
        "p1": "tp26-a-flavio",
        "p2": "tp26-a-joao-curti",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-14",
        "n": 14,
        "round": "R32",
        "p1": "tp26-a-rogester",
        "p2": "tp26-a-claudinho",
        "scores": [
          [
            6,
            1
          ],
          [
            7,
            6
          ]
        ],
        "winner": "tp26-a-claudinho",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-15",
        "n": 15,
        "round": "R32",
        "p1": "tp26-a-johnatan",
        "p2": "tp26-a-r-setor",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-16",
        "n": 16,
        "round": "R32",
        "p1": "tp26-a-gianni-j",
        "p2": "tp26-a-jorgi",
        "scores": [
          [
            6,
            4
          ]
        ],
        "winner": "tp26-a-jorgi",
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "R16": [
      {
        "id": "m-r16-17",
        "n": 17,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-18",
        "n": 18,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-19",
        "n": 19,
        "round": "R16",
        "p1": "tp26-a-panda",
        "p2": "tp26-a-tammaro",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-20",
        "n": 20,
        "round": "R16",
        "p1": "tp26-a-sandro",
        "p2": "tp26-a-rodrigo-v",
        "scores": [
          [
            6,
            0
          ],
          [
            6,
            1
          ]
        ],
        "winner": "tp26-a-sandro",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-21",
        "n": 21,
        "round": "R16",
        "p1": "tp26-a-cristian",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-22",
        "n": 22,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-23",
        "n": 23,
        "round": "R16",
        "p1": null,
        "p2": "tp26-a-claudinho",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-24",
        "n": 24,
        "round": "R16",
        "p1": "tp26-a-jorgi",
        "p2": "tp26-a-rafael-k",
        "scores": [
          [
            6,
            4
          ]
        ],
        "winner": "tp26-a-jorgi",
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "QF": [
      {
        "id": "m-qf-25",
        "n": 25,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-26",
        "n": 26,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-27",
        "n": 27,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-28",
        "n": 28,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "SF": [
      {
        "id": "m-sf-29",
        "n": 29,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-sf-30",
        "n": 30,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "F": [
      {
        "id": "m-f-31",
        "n": 31,
        "round": "F",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ]
  },
  "drawn": true,
  "publishedAt": "2026-04-28T00:00:00Z",
  "entries": [
    {
      "id": "tp26-a-ian",
      "name": "Ian",
      "accountEmails": [
        "ian@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-rebol-mb",
      "name": "L. Rebolças / M. Bomba",
      "accountEmails": [
        "lrebolcas@tennispointt.com.br",
        "mbomba@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-paulao",
      "name": "Paulão",
      "accountEmails": [
        "paulao@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-pan",
      "name": "Pan",
      "accountEmails": [
        "pan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-fabinho",
      "name": "Fabinho",
      "accountEmails": [
        "fabinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-joao-rossi",
      "name": "João Rossi",
      "accountEmails": [
        "joaorossi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-fcarvoli",
      "name": "F. Carvoli",
      "accountEmails": [
        "fcarvoli@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-brunno-c",
      "name": "Brunno C.",
      "accountEmails": [
        "brunnoc@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-marcelo-r",
      "name": "Marcelo R.",
      "accountEmails": [
        "marcelor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-panda",
      "name": "Panda",
      "accountEmails": [
        "panda@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-breno",
      "name": "Breno",
      "accountEmails": [
        "breno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-tammaro",
      "name": "Tammaro",
      "accountEmails": [
        "tammaro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-lucas-n",
      "name": "Lucas N.",
      "accountEmails": [
        "lucasn@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-thais",
      "name": "Thais",
      "accountEmails": [
        "thais@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-sandro-h",
      "name": "Sandro / Heraldo",
      "accountEmails": [
        "sandro@tennispointt.com.br",
        "heraldo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-sandro",
      "name": "Sandro",
      "accountEmails": [
        "sandro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-rodrigo-v",
      "name": "Rodrigo V.",
      "accountEmails": [
        "rodrigov@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-fabio-i",
      "name": "Fábio I.",
      "accountEmails": [
        "fabioi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-cristian",
      "name": "Cristian",
      "accountEmails": [
        "cristian@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-edu-cap",
      "name": "Edu Cap.",
      "accountEmails": [
        "educap@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-felipe-c",
      "name": "Felipe C.",
      "accountEmails": [
        "felipec@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-magno",
      "name": "Magno",
      "accountEmails": [
        "magno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-luciano-ub",
      "name": "Luciano Ub.",
      "accountEmails": [
        "lucianoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-m-caldera",
      "name": "M. Caldera",
      "accountEmails": [
        "mcaldera@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-martin",
      "name": "Martin",
      "accountEmails": [
        "martin@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-flavio",
      "name": "Flávio",
      "accountEmails": [
        "flavio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-joao-curti",
      "name": "João Curti",
      "accountEmails": [
        "joaocurti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-rogester",
      "name": "Rogester",
      "accountEmails": [
        "rogester@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-claudinho",
      "name": "Claudinho",
      "accountEmails": [
        "claudinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-johnatan",
      "name": "Johnatan",
      "accountEmails": [
        "johnatan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-r-setor",
      "name": "R. Setor",
      "accountEmails": [
        "rsetor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-gianni-j",
      "name": "Gianni / Jorgi",
      "accountEmails": [
        "gianni@tennispointt.com.br",
        "jorgi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-jorgi",
      "name": "Jorgi",
      "accountEmails": [
        "jorgi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-a-rafael-k",
      "name": "Rafael K.",
      "accountEmails": [
        "rafaelk@tennispointt.com.br"
      ]
    }
  ]
}
$JSON$::jsonb FROM t
WHERE NOT EXISTS (SELECT 1 FROM public.brackets b WHERE b.tournament_id = (SELECT id FROM t) AND b.category_id = 'cat-a');

-- 4.cat-5a
WITH t AS (SELECT id FROM public.tournaments WHERE name = 'Torneio Tênis Point 2026' LIMIT 1)
INSERT INTO public.brackets (tournament_id, category_id, drawn, data)
SELECT t.id, 'cat-5a', true, $JSON$
{
  "rounds": [
    "R32",
    "R16",
    "QF",
    "SF",
    "F"
  ],
  "matches": {
    "R32": [
      {
        "id": "m-r32-1",
        "n": 1,
        "round": "R32",
        "p1": "tp26-5a-marcelo-ribeiro",
        "p2": "tp26-5a-feeder-1",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-2",
        "n": 2,
        "round": "R32",
        "p1": "tp26-5a-feeder-2",
        "p2": "tp26-5a-luciano-ub",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-3",
        "n": 3,
        "round": "R32",
        "p1": "tp26-5a-edu-cap",
        "p2": "tp26-5a-celio",
        "scores": [
          [
            6,
            1
          ],
          [
            7,
            6
          ]
        ],
        "winner": "tp26-5a-celio",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-4",
        "n": 4,
        "round": "R32",
        "p1": "tp26-5a-feeder-4",
        "p2": "tp26-5a-f-carvoli",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-5",
        "n": 5,
        "round": "R32",
        "p1": "tp26-5a-rogester",
        "p2": "tp26-5a-feeder-5",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-6",
        "n": 6,
        "round": "R32",
        "p1": "tp26-5a-henrique",
        "p2": "tp26-5a-feeder-7",
        "scores": [],
        "winner": "tp26-5a-henrique",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-7",
        "n": 7,
        "round": "R32",
        "p1": "tp26-5a-gianni",
        "p2": "tp26-5a-feeder-8",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-8",
        "n": 8,
        "round": "R32",
        "p1": "tp26-5a-feeder-9",
        "p2": "tp26-5a-magno",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-9",
        "n": 9,
        "round": "R32",
        "p1": "tp26-5a-johnatan",
        "p2": "tp26-5a-feeder-10",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-10",
        "n": 10,
        "round": "R32",
        "p1": "tp26-5a-feeder-11",
        "p2": "tp26-5a-breno",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-11",
        "n": 11,
        "round": "R32",
        "p1": "tp26-5a-joao-curti",
        "p2": "tp26-5a-feeder-12",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-12",
        "n": 12,
        "round": "R32",
        "p1": "tp26-5a-feeder-13",
        "p2": "tp26-5a-feeder-14",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-13",
        "n": 13,
        "round": "R32",
        "p1": "tp26-5a-paulao",
        "p2": "tp26-5a-gabriel-ub",
        "scores": [
          [
            5,
            7
          ],
          [
            6,
            0
          ],
          [
            10,
            2
          ]
        ],
        "winner": "tp26-5a-gabriel-ub",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-14",
        "n": 14,
        "round": "R32",
        "p1": "tp26-5a-feeder-16",
        "p2": "tp26-5a-feeder-17",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-15",
        "n": 15,
        "round": "R32",
        "p1": "tp26-5a-r-setor",
        "p2": "tp26-5a-feeder-18",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-16",
        "n": 16,
        "round": "R32",
        "p1": "tp26-5a-feeder-19",
        "p2": "tp26-5a-feeder-20",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "R16": [
      {
        "id": "m-r16-17",
        "n": 17,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-18",
        "n": 18,
        "round": "R16",
        "p1": "tp26-5a-celio",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-19",
        "n": 19,
        "round": "R16",
        "p1": null,
        "p2": "tp26-5a-henrique",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-20",
        "n": 20,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-21",
        "n": 21,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-22",
        "n": 22,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-23",
        "n": 23,
        "round": "R16",
        "p1": "tp26-5a-gabriel-ub",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-24",
        "n": 24,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "QF": [
      {
        "id": "m-qf-25",
        "n": 25,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-26",
        "n": 26,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-27",
        "n": 27,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-28",
        "n": 28,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "SF": [
      {
        "id": "m-sf-29",
        "n": 29,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-sf-30",
        "n": 30,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "F": [
      {
        "id": "m-f-31",
        "n": 31,
        "round": "F",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ]
  },
  "drawn": true,
  "publishedAt": "2026-04-28T00:00:00Z",
  "entries": [
    {
      "id": "tp26-5a-marcelo-ribeiro",
      "name": "Marcelo Ribeiro",
      "accountEmails": [
        "marceloribeiro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-guilherme",
      "name": "Guilherme",
      "accountEmails": [
        "guilherme@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-thiago-c",
      "name": "Thiago C.",
      "accountEmails": [
        "thiagoc@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-bueno",
      "name": "Bueno",
      "accountEmails": [
        "bueno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-luciano-ub",
      "name": "Luciano Ub.",
      "accountEmails": [
        "lucianoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-edu-cap",
      "name": "Edu Cap.",
      "accountEmails": [
        "educap@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-bruno-p",
      "name": "Bruno P.",
      "accountEmails": [
        "brunop@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-celio",
      "name": "Célio",
      "accountEmails": [
        "celio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-panda",
      "name": "Panda",
      "accountEmails": [
        "panda@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-lucas-bur",
      "name": "Lucas Bur.",
      "accountEmails": [
        "lucasbur@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-f-carvoli",
      "name": "F. Carvoli",
      "accountEmails": [
        "fcarvoli@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-rogester",
      "name": "Rogester",
      "accountEmails": [
        "rogester@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-reinaldo",
      "name": "Reinaldo",
      "accountEmails": [
        "reinaldo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-marcelinho",
      "name": "Marcelinho",
      "accountEmails": [
        "marcelinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-henrique",
      "name": "Henrique",
      "accountEmails": [
        "henrique@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-arthur",
      "name": "Arthur",
      "accountEmails": [
        "arthur@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-titis",
      "name": "Titis",
      "accountEmails": [
        "titis@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-m-caldera",
      "name": "M. Caldera",
      "accountEmails": [
        "mcaldera@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-gianni",
      "name": "Gianni",
      "accountEmails": [
        "gianni@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-augusto",
      "name": "Augusto",
      "accountEmails": [
        "augusto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-juliano",
      "name": "Juliano",
      "accountEmails": [
        "juliano@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-duarte",
      "name": "Duarte",
      "accountEmails": [
        "duarte@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-alvaro",
      "name": "Alvaro",
      "accountEmails": [
        "alvaro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-magno",
      "name": "Magno",
      "accountEmails": [
        "magno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-johnatan",
      "name": "Johnatan",
      "accountEmails": [
        "johnatan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-silvio",
      "name": "Sílvio",
      "accountEmails": [
        "silvio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-m-bomba",
      "name": "M. Bomba",
      "accountEmails": [
        "mbomba@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-pepe",
      "name": "Pepe",
      "accountEmails": [
        "pepe@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-r-barros",
      "name": "R. Barros",
      "accountEmails": [
        "rbarros@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-breno",
      "name": "Breno",
      "accountEmails": [
        "breno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-joao-curti",
      "name": "João Curti",
      "accountEmails": [
        "joaocurti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-m-canete",
      "name": "M. Canete",
      "accountEmails": [
        "mcanete@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-guto",
      "name": "Guto",
      "accountEmails": [
        "guto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-thiaguinho",
      "name": "Thiaguinho",
      "accountEmails": [
        "thiaguinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-thais",
      "name": "Thais",
      "accountEmails": [
        "thais@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-joao-rossi",
      "name": "João Rossi",
      "accountEmails": [
        "joaorossi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-jorgi",
      "name": "Jorgi",
      "accountEmails": [
        "jorgi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-paulao",
      "name": "Paulão",
      "accountEmails": [
        "paulao@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-t-bispo",
      "name": "T. Bispo",
      "accountEmails": [
        "tbispo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-gabriel-ub",
      "name": "Gabriel Ub.",
      "accountEmails": [
        "gabrielub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-rebolcas",
      "name": "L. Rebolças",
      "accountEmails": [
        "lrebolcas@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-heraldo",
      "name": "Heraldo",
      "accountEmails": [
        "heraldo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-mario-chile",
      "name": "Mário Chile",
      "accountEmails": [
        "mariochile@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-marcao-h",
      "name": "Marcão H.",
      "accountEmails": [
        "marcaoh@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-r-setor",
      "name": "R. Setor",
      "accountEmails": [
        "rsetor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-l-castro",
      "name": "L. Castro",
      "accountEmails": [
        "lcastro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-leo-curti",
      "name": "Léo Curti",
      "accountEmails": [
        "leocurti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-longueti",
      "name": "Longueti",
      "accountEmails": [
        "longueti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-rodrigo-ub",
      "name": "Rodrigo Ub.",
      "accountEmails": [
        "rodrigoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-riad",
      "name": "Riad",
      "accountEmails": [
        "riad@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-cristian-ub",
      "name": "Cristian Ub.",
      "accountEmails": [
        "cristianub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-1",
      "name": "Guilherme / Thiago C.",
      "accountEmails": [
        "guilherme@tennispointt.com.br",
        "thiagoc@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-2",
      "name": "Bueno / Luciano Ub.",
      "accountEmails": [
        "bueno@tennispointt.com.br",
        "lucianoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-4",
      "name": "Panda / Lucas Bur.",
      "accountEmails": [
        "panda@tennispointt.com.br",
        "lucasbur@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-5",
      "name": "Reinaldo / Marcelinho",
      "accountEmails": [
        "reinaldo@tennispointt.com.br",
        "marcelinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-7",
      "name": "Titis / M. Caldera",
      "accountEmails": [
        "titis@tennispointt.com.br",
        "mcaldera@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-8",
      "name": "Augusto / Juliano",
      "accountEmails": [
        "augusto@tennispointt.com.br",
        "juliano@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-9",
      "name": "Duarte / Alvaro",
      "accountEmails": [
        "duarte@tennispointt.com.br",
        "alvaro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-10",
      "name": "Sílvio / M. Bomba",
      "accountEmails": [
        "silvio@tennispointt.com.br",
        "mbomba@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-11",
      "name": "Pepe / R. Barros",
      "accountEmails": [
        "pepe@tennispointt.com.br",
        "rbarros@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-12",
      "name": "M. Canete / Guto",
      "accountEmails": [
        "mcanete@tennispointt.com.br",
        "guto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-13",
      "name": "Thiaguinho / Thais",
      "accountEmails": [
        "thiaguinho@tennispointt.com.br",
        "thais@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-14",
      "name": "João Rossi / Jorgi",
      "accountEmails": [
        "joaorossi@tennispointt.com.br",
        "jorgi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-16",
      "name": "L. Rebolças / Heraldo",
      "accountEmails": [
        "lrebolcas@tennispointt.com.br",
        "heraldo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-17",
      "name": "Mário Chile / Marcão H.",
      "accountEmails": [
        "mariochile@tennispointt.com.br",
        "marcaoh@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-18",
      "name": "L. Castro / Léo Curti",
      "accountEmails": [
        "lcastro@tennispointt.com.br",
        "leocurti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-19",
      "name": "Longueti / Rodrigo Ub.",
      "accountEmails": [
        "longueti@tennispointt.com.br",
        "rodrigoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5a-feeder-20",
      "name": "Riad / Cristian Ub.",
      "accountEmails": [
        "riad@tennispointt.com.br",
        "cristianub@tennispointt.com.br"
      ]
    }
  ]
}
$JSON$::jsonb FROM t
WHERE NOT EXISTS (SELECT 1 FROM public.brackets b WHERE b.tournament_id = (SELECT id FROM t) AND b.category_id = 'cat-5a');

-- 4.cat-5b
WITH t AS (SELECT id FROM public.tournaments WHERE name = 'Torneio Tênis Point 2026' LIMIT 1)
INSERT INTO public.brackets (tournament_id, category_id, drawn, data)
SELECT t.id, 'cat-5b', true, $JSON$
{
  "rounds": [
    "R64",
    "R32",
    "R16",
    "QF",
    "SF",
    "F"
  ],
  "matches": {
    "R64": [
      {
        "id": "m-r64-1",
        "n": 1,
        "round": "R64",
        "p1": "tp26-5b-eden-cleiton",
        "p2": "tp26-5b-thiago-costa",
        "scores": [],
        "winner": "tp26-5b-thiago-costa",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-2",
        "n": 2,
        "round": "R64",
        "p1": "tp26-5b-guilhermo",
        "p2": "tp26-5b-duarte",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-3",
        "n": 3,
        "round": "R64",
        "p1": "tp26-5b-flavio-m",
        "p2": "tp26-5b-aldecir",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-4",
        "n": 4,
        "round": "R64",
        "p1": "tp26-5b-pedro-henrique",
        "p2": "tp26-5b-tiago-burihan",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-5",
        "n": 5,
        "round": "R64",
        "p1": "tp26-5b-celio",
        "p2": "tp26-5b-wando",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-6",
        "n": 6,
        "round": "R64",
        "p1": "tp26-5b-alex-japa-giovani",
        "p2": "tp26-5b-tiago-bispo",
        "scores": [],
        "winner": "tp26-5b-tiago-bispo",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-7",
        "n": 7,
        "round": "R64",
        "p1": "tp26-5b-magal",
        "p2": "tp26-5b-bruno-oliv",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-8",
        "n": 8,
        "round": "R64",
        "p1": "tp26-5b-jaco",
        "p2": "tp26-5b-bueno",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-9",
        "n": 9,
        "round": "R64",
        "p1": null,
        "p2": "tp26-5b-rodrigo-ub",
        "scores": [],
        "winner": "tp26-5b-rodrigo-ub",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-10",
        "n": 10,
        "round": "R64",
        "p1": "tp26-5b-pedro-kokol",
        "p2": "tp26-5b-leandro-neves",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-11",
        "n": 11,
        "round": "R64",
        "p1": "tp26-5b-reinaldo",
        "p2": "tp26-5b-joao-goulart",
        "scores": [
          [
            6,
            4
          ],
          [
            3,
            6
          ],
          [
            10,
            8
          ]
        ],
        "winner": "tp26-5b-joao-goulart",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-12",
        "n": 12,
        "round": "R64",
        "p1": "tp26-5b-china",
        "p2": "tp26-5b-riad",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-13",
        "n": 13,
        "round": "R64",
        "p1": "tp26-5b-wilson",
        "p2": "tp26-5b-cristiano-lodi",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-14",
        "n": 14,
        "round": "R64",
        "p1": "tp26-5b-marco-q",
        "p2": "tp26-5b-serginho",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-15",
        "n": 15,
        "round": "R64",
        "p1": "tp26-5b-mario-chile",
        "p2": "tp26-5b-joao-v",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-16",
        "n": 16,
        "round": "R64",
        "p1": "tp26-5b-julio-p",
        "p2": "tp26-5b-guilherme-ub",
        "scores": [
          [
            6,
            3
          ],
          [
            6,
            0
          ]
        ],
        "winner": "tp26-5b-guilherme-ub",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-17",
        "n": 17,
        "round": "R64",
        "p1": "tp26-5b-gabriel-ub",
        "p2": "tp26-5b-l-felipe",
        "scores": [
          [
            6,
            4
          ],
          [
            6,
            0
          ]
        ],
        "winner": "tp26-5b-l-felipe",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-18",
        "n": 18,
        "round": "R64",
        "p1": "tp26-5b-augusto",
        "p2": null,
        "scores": [],
        "winner": "tp26-5b-augusto",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-19",
        "n": 19,
        "round": "R64",
        "p1": "tp26-5b-glauco-beach",
        "p2": "tp26-5b-miro",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-20",
        "n": 20,
        "round": "R64",
        "p1": "tp26-5b-lucas-ramos",
        "p2": "tp26-5b-lucas-b",
        "scores": [
          [
            6,
            3
          ],
          [
            1,
            6
          ],
          [
            10,
            5
          ]
        ],
        "winner": "tp26-5b-lucas-b",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-21",
        "n": 21,
        "round": "R64",
        "p1": "tp26-5b-sharles-gimenes",
        "p2": "tp26-5b-bruno-pozzatti",
        "scores": [],
        "winner": "tp26-5b-bruno-pozzatti",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-22",
        "n": 22,
        "round": "R64",
        "p1": "tp26-5b-joao-g",
        "p2": "tp26-5b-guto",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-23",
        "n": 23,
        "round": "R64",
        "p1": "tp26-5b-m-canete",
        "p2": "tp26-5b-a-rentes",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-24",
        "n": 24,
        "round": "R64",
        "p1": "tp26-5b-salomao",
        "p2": "tp26-5b-arthur",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-25",
        "n": 25,
        "round": "R64",
        "p1": "tp26-5b-rodrigo-barros",
        "p2": "tp26-5b-fernando-s-seb",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-26",
        "n": 26,
        "round": "R64",
        "p1": "tp26-5b-quina",
        "p2": "tp26-5b-leo-curti",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-27",
        "n": 27,
        "round": "R64",
        "p1": "tp26-5b-lucas-castro",
        "p2": "tp26-5b-rodrigo-rib",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-28",
        "n": 28,
        "round": "R64",
        "p1": "tp26-5b-rogerio",
        "p2": "tp26-5b-silvio",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-29",
        "n": 29,
        "round": "R64",
        "p1": "tp26-5b-renan",
        "p2": "tp26-5b-zuca",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-30",
        "n": 30,
        "round": "R64",
        "p1": "tp26-5b-peru-luis-e",
        "p2": "tp26-5b-gustavo-sc",
        "scores": [],
        "winner": "tp26-5b-gustavo-sc",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-31",
        "n": 31,
        "round": "R64",
        "p1": "tp26-5b-bruno-diniz",
        "p2": "tp26-5b-yan",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-32",
        "n": 32,
        "round": "R64",
        "p1": "tp26-5b-igor",
        "p2": "tp26-5b-pepe",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "R32": [
      {
        "id": "m-r32-33",
        "n": 33,
        "round": "R32",
        "p1": "tp26-5b-thiago-costa",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-34",
        "n": 34,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-35",
        "n": 35,
        "round": "R32",
        "p1": null,
        "p2": "tp26-5b-tiago-bispo",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-36",
        "n": 36,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-37",
        "n": 37,
        "round": "R32",
        "p1": "tp26-5b-rodrigo-ub",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-38",
        "n": 38,
        "round": "R32",
        "p1": "tp26-5b-joao-goulart",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-39",
        "n": 39,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-40",
        "n": 40,
        "round": "R32",
        "p1": null,
        "p2": "tp26-5b-guilherme-ub",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-41",
        "n": 41,
        "round": "R32",
        "p1": "tp26-5b-l-felipe",
        "p2": "tp26-5b-augusto",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-42",
        "n": 42,
        "round": "R32",
        "p1": null,
        "p2": "tp26-5b-lucas-b",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-43",
        "n": 43,
        "round": "R32",
        "p1": "tp26-5b-bruno-pozzatti",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-44",
        "n": 44,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-45",
        "n": 45,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-46",
        "n": 46,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-47",
        "n": 47,
        "round": "R32",
        "p1": null,
        "p2": "tp26-5b-gustavo-sc",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-48",
        "n": 48,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "R16": [
      {
        "id": "m-r16-49",
        "n": 49,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-50",
        "n": 50,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-51",
        "n": 51,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-52",
        "n": 52,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-53",
        "n": 53,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-54",
        "n": 54,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-55",
        "n": 55,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-56",
        "n": 56,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "QF": [
      {
        "id": "m-qf-57",
        "n": 57,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-58",
        "n": 58,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-59",
        "n": 59,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-60",
        "n": 60,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "SF": [
      {
        "id": "m-sf-61",
        "n": 61,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-sf-62",
        "n": 62,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "F": [
      {
        "id": "m-f-63",
        "n": 63,
        "round": "F",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ]
  },
  "drawn": true,
  "publishedAt": "2026-04-28T00:00:00Z",
  "entries": [
    {
      "id": "tp26-5b-eden-cleiton",
      "name": "Éden / Cleiton",
      "accountEmails": [
        "eden@tennispointt.com.br",
        "cleiton@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-thiago-costa",
      "name": "Thiago Costa",
      "accountEmails": [
        "thiagocosta@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-guilhermo",
      "name": "Guilhermo",
      "accountEmails": [
        "guilhermo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-duarte",
      "name": "Duarte",
      "accountEmails": [
        "duarte@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-flavio-m",
      "name": "Flávio M.",
      "accountEmails": [
        "flaviom@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-aldecir",
      "name": "Aldecir",
      "accountEmails": [
        "aldecir@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-pedro-henrique",
      "name": "Pedro Henrique",
      "accountEmails": [
        "pedrohenrique@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-tiago-burihan",
      "name": "Tiago Burihan",
      "accountEmails": [
        "tiagoburihan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-celio",
      "name": "Célio",
      "accountEmails": [
        "celio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-wando",
      "name": "Wando",
      "accountEmails": [
        "wando@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-alex-japa-giovani",
      "name": "Alex Japa / Giovani",
      "accountEmails": [
        "alexjapa@tennispointt.com.br",
        "giovani@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-tiago-bispo",
      "name": "Tiago Bispo",
      "accountEmails": [
        "tiagobispo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-magal",
      "name": "Magal",
      "accountEmails": [
        "magal@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-bruno-oliv",
      "name": "Bruno Oliv.",
      "accountEmails": [
        "brunooliv@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-jaco",
      "name": "Jaco",
      "accountEmails": [
        "jaco@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-bueno",
      "name": "Bueno",
      "accountEmails": [
        "bueno@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-rodrigo-ub",
      "name": "Rodrigo Ub.",
      "accountEmails": [
        "rodrigoub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-pedro-kokol",
      "name": "Pedro Kokol",
      "accountEmails": [
        "pedrokokol@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-leandro-neves",
      "name": "Leandro Neves",
      "accountEmails": [
        "leandroneves@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-reinaldo",
      "name": "Reinaldo",
      "accountEmails": [
        "reinaldo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-joao-goulart",
      "name": "João Goulart",
      "accountEmails": [
        "joaogoulart@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-china",
      "name": "China",
      "accountEmails": [
        "china@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-riad",
      "name": "Riad",
      "accountEmails": [
        "riad@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-wilson",
      "name": "Wilson",
      "accountEmails": [
        "wilson@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-cristiano-lodi",
      "name": "Cristiano Lodi",
      "accountEmails": [
        "cristianolodi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-marco-q",
      "name": "Marco Q.",
      "accountEmails": [
        "marcoq@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-serginho",
      "name": "Serginho",
      "accountEmails": [
        "serginho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-mario-chile",
      "name": "Mário Chile",
      "accountEmails": [
        "mariochile@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-joao-v",
      "name": "João V.",
      "accountEmails": [
        "joaov@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-julio-p",
      "name": "Júlio P.",
      "accountEmails": [
        "juliop@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-guilherme-ub",
      "name": "Guilherme Ub.",
      "accountEmails": [
        "guilhermeub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-guilherme",
      "name": "Guilherme",
      "accountEmails": [
        "guilherme@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-gabriel-ub",
      "name": "Gabriel Ub.",
      "accountEmails": [
        "gabrielub@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-l-felipe",
      "name": "L. Felipe",
      "accountEmails": [
        "lfelipe@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-augusto",
      "name": "Augusto",
      "accountEmails": [
        "augusto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-glauco-beach",
      "name": "Glauco Beach",
      "accountEmails": [
        "glaucobeach@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-miro",
      "name": "Miro",
      "accountEmails": [
        "miro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-lucas-ramos",
      "name": "Lucas Ramos",
      "accountEmails": [
        "lucasramos@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-lucas-b",
      "name": "Lucas B.",
      "accountEmails": [
        "lucasb@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-sharles-gimenes",
      "name": "Sharles / R. Gimenes",
      "accountEmails": [
        "sharles@tennispointt.com.br",
        "rgimenes@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-bruno-pozzatti",
      "name": "Bruno Pozzatti",
      "accountEmails": [
        "brunopozzatti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-joao-g",
      "name": "João G.",
      "accountEmails": [
        "joaog@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-guto",
      "name": "Guto",
      "accountEmails": [
        "guto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-m-canete",
      "name": "M. Canete",
      "accountEmails": [
        "mcanete@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-a-rentes",
      "name": "A. Rentes",
      "accountEmails": [
        "arentes@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-salomao",
      "name": "Salomão",
      "accountEmails": [
        "salomao@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-arthur",
      "name": "Arthur",
      "accountEmails": [
        "arthur@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-rodrigo-barros",
      "name": "Rodrigo Barros",
      "accountEmails": [
        "rodrigobarros@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-fernando-s-seb",
      "name": "Fernando S. Seb.",
      "accountEmails": [
        "fernandosseb@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-quina",
      "name": "Quina",
      "accountEmails": [
        "quina@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-leo-curti",
      "name": "Léo Curti",
      "accountEmails": [
        "leocurti@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-lucas-castro",
      "name": "Lucas Castro",
      "accountEmails": [
        "lucascastro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-rodrigo-rib",
      "name": "Rodrigo Rib.",
      "accountEmails": [
        "rodrigorib@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-rogerio",
      "name": "Rogério",
      "accountEmails": [
        "rogerio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-silvio",
      "name": "Sílvio",
      "accountEmails": [
        "silvio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-renan",
      "name": "Renan",
      "accountEmails": [
        "renan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-zuca",
      "name": "Zuca",
      "accountEmails": [
        "zuca@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-peru-luis-e",
      "name": "Peru / Luís E.",
      "accountEmails": [
        "peru@tennispointt.com.br",
        "luise@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-gustavo-sc",
      "name": "Gustavo sc",
      "accountEmails": [
        "gustavosc@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-bruno-diniz",
      "name": "Bruno Diniz",
      "accountEmails": [
        "brunodiniz@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-yan",
      "name": "Yan",
      "accountEmails": [
        "yan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-igor",
      "name": "Igor",
      "accountEmails": [
        "igor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-5b-pepe",
      "name": "Pepe",
      "accountEmails": [
        "pepe@tennispointt.com.br"
      ]
    }
  ]
}
$JSON$::jsonb FROM t
WHERE NOT EXISTS (SELECT 1 FROM public.brackets b WHERE b.tournament_id = (SELECT id FROM t) AND b.category_id = 'cat-5b');

-- 4.cat-c
WITH t AS (SELECT id FROM public.tournaments WHERE name = 'Torneio Tênis Point 2026' LIMIT 1)
INSERT INTO public.brackets (tournament_id, category_id, drawn, data)
SELECT t.id, 'cat-c', true, $JSON$
{
  "rounds": [
    "R64",
    "R32",
    "R16",
    "QF",
    "SF",
    "F"
  ],
  "matches": {
    "R64": [
      {
        "id": "m-r64-1",
        "n": 1,
        "round": "R64",
        "p1": null,
        "p2": "tp26-c-ratinho",
        "scores": [],
        "winner": "tp26-c-ratinho",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-2",
        "n": 2,
        "round": "R64",
        "p1": "tp26-c-sharles",
        "p2": "tp26-c-cleiton",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-3",
        "n": 3,
        "round": "R64",
        "p1": "tp26-c-lucas-ramos",
        "p2": "tp26-c-alan-r",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-4",
        "n": 4,
        "round": "R64",
        "p1": "tp26-c-humberto",
        "p2": "tp26-c-marco-q",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-5",
        "n": 5,
        "round": "R64",
        "p1": "tp26-c-china",
        "p2": "tp26-c-leo-paes",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-6",
        "n": 6,
        "round": "R64",
        "p1": "tp26-c-baduca",
        "p2": "tp26-c-bruno-o",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-7",
        "n": 7,
        "round": "R64",
        "p1": "tp26-c-wando",
        "p2": "tp26-c-fredi",
        "scores": [
          [
            6,
            1
          ],
          [
            6,
            3
          ]
        ],
        "winner": "tp26-c-wando",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-8",
        "n": 8,
        "round": "R64",
        "p1": "tp26-c-joao-rj",
        "p2": "tp26-c-guilhermo",
        "scores": [
          [
            6,
            1
          ],
          [
            6,
            2
          ]
        ],
        "winner": "tp26-c-guilhermo",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-9",
        "n": 9,
        "round": "R64",
        "p1": "tp26-c-paulo",
        "p2": "tp26-c-edmilson",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-10",
        "n": 10,
        "round": "R64",
        "p1": "tp26-c-fagner",
        "p2": "tp26-c-luis-felipe",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-11",
        "n": 11,
        "round": "R64",
        "p1": "tp26-c-elaine",
        "p2": "tp26-c-a-peru",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-12",
        "n": 12,
        "round": "R64",
        "p1": "tp26-c-romeu",
        "p2": "tp26-c-andre-r",
        "scores": [
          [
            6,
            3
          ],
          [
            6,
            1
          ]
        ],
        "winner": "tp26-c-andre-r",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-13",
        "n": 13,
        "round": "R64",
        "p1": "tp26-c-rodrigo-rib",
        "p2": "tp26-c-lukas",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-14",
        "n": 14,
        "round": "R64",
        "p1": "tp26-c-rafael-e",
        "p2": "tp26-c-rafael-gim",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-15",
        "n": 15,
        "round": "R64",
        "p1": "tp26-c-zuca",
        "p2": "tp26-c-luis-eduardo",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-16",
        "n": 16,
        "round": "R64",
        "p1": null,
        "p2": "tp26-c-miro",
        "scores": [],
        "winner": "tp26-c-miro",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-17",
        "n": 17,
        "round": "R64",
        "p1": "tp26-c-yan",
        "p2": "tp26-c-lucas-gallina",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-18",
        "n": 18,
        "round": "R64",
        "p1": "tp26-c-robertinho",
        "p2": "tp26-c-rogerio",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-19",
        "n": 19,
        "round": "R64",
        "p1": "tp26-c-aldecir",
        "p2": "tp26-c-cristiano-lodi",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-20",
        "n": 20,
        "round": "R64",
        "p1": "tp26-c-julio-guto",
        "p2": "tp26-c-pedro-henrique",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-21",
        "n": 21,
        "round": "R64",
        "p1": "tp26-c-caio",
        "p2": "tp26-c-ton",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-22",
        "n": 22,
        "round": "R64",
        "p1": "tp26-c-alex-japa",
        "p2": "tp26-c-vitor",
        "scores": [
          [
            7,
            6
          ],
          [
            3,
            6
          ],
          [
            10,
            8
          ]
        ],
        "winner": "tp26-c-vitor",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-23",
        "n": 23,
        "round": "R64",
        "p1": "tp26-c-igor",
        "p2": "tp26-c-ulisses",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-24",
        "n": 24,
        "round": "R64",
        "p1": "tp26-c-dr-douglas",
        "p2": "tp26-c-rogester",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-25",
        "n": 25,
        "round": "R64",
        "p1": null,
        "p2": "tp26-c-fernando-rufino",
        "scores": [],
        "winner": "tp26-c-fernando-rufino",
        "date": null,
        "time": null,
        "isBye": true
      },
      {
        "id": "m-r64-26",
        "n": 26,
        "round": "R64",
        "p1": "tp26-c-danilo",
        "p2": "tp26-c-rodrigo-quina",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-27",
        "n": 27,
        "round": "R64",
        "p1": "tp26-c-joao-goulart",
        "p2": "tp26-c-vinicius",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-28",
        "n": 28,
        "round": "R64",
        "p1": "tp26-c-nicolas",
        "p2": "tp26-c-julio-p",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-29",
        "n": 29,
        "round": "R64",
        "p1": "tp26-c-jaco",
        "p2": "tp26-c-pedro-kokol",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-30",
        "n": 30,
        "round": "R64",
        "p1": "tp26-c-giovani",
        "p2": "tp26-c-joao-guilherme",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-31",
        "n": 31,
        "round": "R64",
        "p1": "tp26-c-eden",
        "p2": "tp26-c-juscelino",
        "scores": [
          [
            6,
            3
          ],
          [
            7,
            6
          ]
        ],
        "winner": "tp26-c-eden",
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r64-32",
        "n": 32,
        "round": "R64",
        "p1": "tp26-c-salomao",
        "p2": null,
        "scores": [],
        "winner": "tp26-c-salomao",
        "date": null,
        "time": null,
        "isBye": true
      }
    ],
    "R32": [
      {
        "id": "m-r32-33",
        "n": 33,
        "round": "R32",
        "p1": "tp26-c-ratinho",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-34",
        "n": 34,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-35",
        "n": 35,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-36",
        "n": 36,
        "round": "R32",
        "p1": "tp26-c-wando",
        "p2": "tp26-c-guilhermo",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-37",
        "n": 37,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-38",
        "n": 38,
        "round": "R32",
        "p1": null,
        "p2": "tp26-c-andre-r",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-39",
        "n": 39,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-40",
        "n": 40,
        "round": "R32",
        "p1": null,
        "p2": "tp26-c-miro",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-41",
        "n": 41,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-42",
        "n": 42,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-43",
        "n": 43,
        "round": "R32",
        "p1": null,
        "p2": "tp26-c-vitor",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-44",
        "n": 44,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-45",
        "n": 45,
        "round": "R32",
        "p1": "tp26-c-fernando-rufino",
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-46",
        "n": 46,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-47",
        "n": 47,
        "round": "R32",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r32-48",
        "n": 48,
        "round": "R32",
        "p1": "tp26-c-eden",
        "p2": "tp26-c-salomao",
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "R16": [
      {
        "id": "m-r16-49",
        "n": 49,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-50",
        "n": 50,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-51",
        "n": 51,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-52",
        "n": 52,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-53",
        "n": 53,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-54",
        "n": 54,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-55",
        "n": 55,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-r16-56",
        "n": 56,
        "round": "R16",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "QF": [
      {
        "id": "m-qf-57",
        "n": 57,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-58",
        "n": 58,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-59",
        "n": 59,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-qf-60",
        "n": 60,
        "round": "QF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "SF": [
      {
        "id": "m-sf-61",
        "n": 61,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      },
      {
        "id": "m-sf-62",
        "n": 62,
        "round": "SF",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ],
    "F": [
      {
        "id": "m-f-63",
        "n": 63,
        "round": "F",
        "p1": null,
        "p2": null,
        "scores": [],
        "winner": null,
        "date": null,
        "time": null,
        "isBye": false
      }
    ]
  },
  "drawn": true,
  "publishedAt": "2026-04-28T00:00:00Z",
  "entries": [
    {
      "id": "tp26-c-ratinho",
      "name": "Ratinho",
      "accountEmails": [
        "ratinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-sharles",
      "name": "Sharles",
      "accountEmails": [
        "sharles@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-cleiton",
      "name": "Cleiton",
      "accountEmails": [
        "cleiton@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-lucas-ramos",
      "name": "Lucas Ramos",
      "accountEmails": [
        "lucasramos@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-alan-r",
      "name": "Alan R.",
      "accountEmails": [
        "alanr@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-humberto",
      "name": "Humberto",
      "accountEmails": [
        "humberto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-marco-q",
      "name": "Marco Q.",
      "accountEmails": [
        "marcoq@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-china",
      "name": "China",
      "accountEmails": [
        "china@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-leo-paes",
      "name": "Léo Paes",
      "accountEmails": [
        "leopaes@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-baduca",
      "name": "Baduca",
      "accountEmails": [
        "baduca@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-bruno-o",
      "name": "Bruno O.",
      "accountEmails": [
        "brunoo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-wando",
      "name": "Wando",
      "accountEmails": [
        "wando@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-fredi",
      "name": "Fredi",
      "accountEmails": [
        "fredi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-joao-rj",
      "name": "João RJ",
      "accountEmails": [
        "joaorj@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-guilhermo",
      "name": "Guilhermo",
      "accountEmails": [
        "guilhermo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-paulo",
      "name": "Paulo",
      "accountEmails": [
        "paulo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-edmilson",
      "name": "Edmilson",
      "accountEmails": [
        "edmilson@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-fagner",
      "name": "Fagner",
      "accountEmails": [
        "fagner@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-luis-felipe",
      "name": "Luis Felipe",
      "accountEmails": [
        "luisfelipe@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-elaine",
      "name": "Elaine",
      "accountEmails": [
        "elaine@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-a-peru",
      "name": "A. Peru",
      "accountEmails": [
        "aperu@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-romeu",
      "name": "Romeu",
      "accountEmails": [
        "romeu@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-andre-r",
      "name": "André R.",
      "accountEmails": [
        "andrer@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rodrigo-rib",
      "name": "Rodrigo Rib.",
      "accountEmails": [
        "rodrigorib@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-lukas",
      "name": "Lukas",
      "accountEmails": [
        "lukas@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rafael-e",
      "name": "Rafael E.",
      "accountEmails": [
        "rafaele@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rafael-gim",
      "name": "Rafael Gim.",
      "accountEmails": [
        "rafaelgim@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-zuca",
      "name": "Zuca",
      "accountEmails": [
        "zuca@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-luis-eduardo",
      "name": "Luis Eduardo",
      "accountEmails": [
        "luiseduardo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-miro",
      "name": "Miro",
      "accountEmails": [
        "miro@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-yan",
      "name": "Yan",
      "accountEmails": [
        "yan@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-lucas-gallina",
      "name": "Lucas Gallina",
      "accountEmails": [
        "lucasgallina@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-robertinho",
      "name": "Robertinho",
      "accountEmails": [
        "robertinho@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rogerio",
      "name": "Rogério",
      "accountEmails": [
        "rogerio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-aldecir",
      "name": "Aldecir",
      "accountEmails": [
        "aldecir@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-cristiano-lodi",
      "name": "Cristiano Lodi",
      "accountEmails": [
        "cristianolodi@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-julio-guto",
      "name": "Júlio Guto",
      "accountEmails": [
        "julioguto@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-pedro-henrique",
      "name": "Pedro Henrique",
      "accountEmails": [
        "pedrohenrique@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-caio",
      "name": "Caio",
      "accountEmails": [
        "caio@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-ton",
      "name": "Ton",
      "accountEmails": [
        "ton@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-alex-japa",
      "name": "Alex Japa",
      "accountEmails": [
        "alexjapa@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-vitor",
      "name": "Vitor",
      "accountEmails": [
        "vitor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-igor",
      "name": "Igor",
      "accountEmails": [
        "igor@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-ulisses",
      "name": "Ulisses",
      "accountEmails": [
        "ulisses@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-dr-douglas",
      "name": "Dr Douglas",
      "accountEmails": [
        "drdouglas@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rogester",
      "name": "Rogester",
      "accountEmails": [
        "rogester@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-fernando-rufino",
      "name": "Fernando Rufino",
      "accountEmails": [
        "fernandorufino@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-danilo",
      "name": "Danilo",
      "accountEmails": [
        "danilo@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-rodrigo-quina",
      "name": "Rodrigo Quina",
      "accountEmails": [
        "rodrigoquina@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-joao-goulart",
      "name": "João Goulart",
      "accountEmails": [
        "joaogoulart@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-vinicius",
      "name": "Vinícius",
      "accountEmails": [
        "vinicius@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-nicolas",
      "name": "Nícolas",
      "accountEmails": [
        "nicolas@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-julio-p",
      "name": "Júlio P.",
      "accountEmails": [
        "juliop@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-jaco",
      "name": "Jacó",
      "accountEmails": [
        "jaco@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-pedro-kokol",
      "name": "Pedro Kokol",
      "accountEmails": [
        "pedrokokol@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-giovani",
      "name": "Giovani",
      "accountEmails": [
        "giovani@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-joao-guilherme",
      "name": "João Guilherme",
      "accountEmails": [
        "joaoguilherme@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-eden",
      "name": "Éden",
      "accountEmails": [
        "eden@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-juscelino",
      "name": "Juscelino",
      "accountEmails": [
        "juscelino@tennispointt.com.br"
      ]
    },
    {
      "id": "tp26-c-salomao",
      "name": "Salomão",
      "accountEmails": [
        "salomao@tennispointt.com.br"
      ]
    }
  ]
}
$JSON$::jsonb FROM t
WHERE NOT EXISTS (SELECT 1 FROM public.brackets b WHERE b.tournament_id = (SELECT id FROM t) AND b.category_id = 'cat-c');

-- ============================================================
-- Verificação (rode DEPOIS):
-- SELECT count(*) FROM public.profiles WHERE role='admin';                  -- esperado: 1+ (johnatan)
-- SELECT id, name FROM public.categories ORDER BY order_index;              -- esperado: cat-a, cat-5a..., cat-c
-- SELECT name, status FROM public.tournaments;                              -- esperado: Torneio Tênis Point 2026 active
-- SELECT category_id, drawn, jsonb_array_length(data->'rounds') AS n_rounds,
--        jsonb_object_keys(data->'matches') FROM public.brackets;
-- ============================================================
