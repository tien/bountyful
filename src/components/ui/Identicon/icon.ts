import { blake2b as blake2bJs } from "@noble/hashes/blake2b";
import { AccountId } from "polkadot-api";

export function blake2AsU8a(
  data: Uint8Array,
  bitLength: 64 | 128 | 256 | 384 | 512 = 256,
  key?: Uint8Array | null,
): Uint8Array {
  const byteLength = Math.ceil(bitLength / 8);
  const u8a = data;

  return key
    ? blake2bJs(u8a, { dkLen: byteLength, key })
    : blake2bJs(u8a, { dkLen: byteLength });
}

interface Scheme {
  freq: number;
  colors: readonly number[];
}

const S = 64;
const C = S / 2;
const Z = (S / 64) * 5;

const SCHEMES: readonly Scheme[] = [
  /* target  */ {
    colors: [0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 1],
    freq: 1,
  },
  /* cube    */ {
    colors: [0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 5],
    freq: 20,
  },
  /* quazar  */ {
    colors: [1, 2, 3, 1, 2, 4, 5, 5, 4, 1, 2, 3, 1, 2, 4, 5, 5, 4, 0],
    freq: 16,
  },
  /* flower  */ {
    colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3],
    freq: 32,
  },
  /* cyclic  */ {
    colors: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6],
    freq: 32,
  },
  /* vmirror */ {
    colors: [0, 1, 2, 3, 4, 5, 3, 4, 2, 0, 1, 6, 7, 8, 9, 7, 8, 6, 10],
    freq: 128,
  },
  /* hmirror */ {
    colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 7, 5, 3, 4, 2, 11],
    freq: 128,
  },
];

const SCHEMES_TOTAL = SCHEMES.map((s): number => s.freq).reduce(
  (a, b): number => a + b,
);

export type Circle = {
  cx: number;
  cy: number;
  fill: string;
  r: number;
};

const OUTER_CIRCLE: Circle = {
  cx: C,
  cy: C,
  fill: "var(--colors-bg-default)",
  r: C,
};

let zeroHash: Uint8Array = new Uint8Array();

function getRotation(isSixPoint: boolean): {
  r: number;
  ro2: number;
  r3o4: number;
  ro4: number;
  rroot3o2: number;
  rroot3o4: number;
} {
  const r = isSixPoint ? (C / 8) * 5 : (C / 4) * 3;
  const rroot3o2 = (r * Math.sqrt(3)) / 2;
  const ro2 = r / 2;
  const rroot3o4 = (r * Math.sqrt(3)) / 4;
  const ro4 = r / 4;
  const r3o4 = (r * 3) / 4;

  return { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 };
}

function getCircleXY(isSixPoint = false): [number, number][] {
  const { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 } = getRotation(isSixPoint);

  return [
    [C, C - r],
    [C, C - ro2],
    [C - rroot3o4, C - r3o4],
    [C - rroot3o2, C - ro2],
    [C - rroot3o4, C - ro4],
    [C - rroot3o2, C],
    [C - rroot3o2, C + ro2],
    [C - rroot3o4, C + ro4],
    [C - rroot3o4, C + r3o4],
    [C, C + r],
    [C, C + ro2],
    [C + rroot3o4, C + r3o4],
    [C + rroot3o2, C + ro2],
    [C + rroot3o4, C + ro4],
    [C + rroot3o2, C],
    [C + rroot3o2, C - ro2],
    [C + rroot3o4, C - ro4],
    [C + rroot3o4, C - r3o4],
    [C, C],
  ];
}

function findScheme(d: number): Scheme {
  let cum = 0;
  const schema = SCHEMES.find((schema): boolean => {
    cum += schema.freq;

    return d < cum;
  });

  if (!schema) {
    throw new Error("Unable to find schema");
  }

  return schema;
}

function addressToId(address: string): Uint8Array {
  if (!zeroHash.length) {
    zeroHash = blake2AsU8a(new Uint8Array(32), 512);
  }

  return blake2AsU8a(AccountId().enc(address), 512).map(
    (x, i) => (x + 256 - zeroHash[i]) % 256,
  );
}

function getColors(address: string): string[] {
  const id = addressToId(address);
  const d = Math.floor((id[30] + id[31] * 256) % SCHEMES_TOTAL);
  const rot = (id[28] % 6) * 3;
  const sat = (Math.floor((id[29] * 70) / 256 + 26) % 80) + 30;
  const scheme = findScheme(d);
  const palette = Array.from(id).map((x, i): string => {
    const b = (x + (i % 28) * 58) % 256;

    if (b === 0) {
      return "#444";
    } else if (b === 255) {
      return "transparent";
    }

    const h = Math.floor(((b % 64) * 360) / 64);
    const l = [53, 15, 35, 75][Math.floor(b / 64)];

    return `hsl(${h}, ${sat}%, ${l}%)`;
  });

  return scheme.colors.map(
    (_, i): string => palette[scheme.colors[i < 18 ? (i + rot) % 18 : 18]],
  );
}

/**
 * @description Generates an array of the circles that make up an identicon
 */
export function polkadotIcon(address: string): Circle[] {
  const xy = getCircleXY();
  let colors: string[];

  try {
    // in some cases, e.g. RN where crypto may not be initialized, chaos can
    // happen when hashing, in these cases we just fill with a placeholder
    colors = getColors(address);
  } catch {
    colors = new Array<string>(xy.length).fill("#ddd");
  }

  return [OUTER_CIRCLE].concat(
    xy.map(
      ([cx, cy], index): Circle => ({
        cx,
        cy,
        fill: colors[index],
        r: Z,
      }),
    ),
  );
}
