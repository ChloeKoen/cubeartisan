export default CardDetailsPropType;
export type CardPrices = import('@cubeartisan/client/proptypes/CardPricePropType.js').CardPrices;
export type CardLegalities = import('@cubeartisan/client/proptypes/CardLegalitiesPropType.js').CardLegalities;
export type Color = 'W' | 'U' | 'B' | 'R' | 'G';
export type CardDetails = {
    color_identity: Color[];
    set: string;
    set_name: string;
    foil: boolean;
    nonfoil: boolean;
    collector_number: string;
    released_at: string;
    reprint: boolean;
    promo: boolean;
    prices: CardPrices;
    elo: number;
    digital: boolean;
    isToken: boolean;
    border_color: string;
    name: string;
    name_lower: string;
    full_name: string;
    artist: string | null;
    scryfall_uri: string;
    rarity: string;
    oracle_text: string | null;
    _id: string;
    oracle_id: string;
    cmc: number;
    legalities: CardLegalities;
    parsed_cost: string[];
    colors: Color[] | null;
    type: string;
    full_art: boolean;
    language: string;
    mtgo_id: number | null;
    layout: string;
    tcgplayer_id: number | null;
    loyalty: string | null;
    power: string | null;
    toughness: string | null;
    image_small: string | null;
    image_normal: string | null;
    art_crop: string | null;
    image_flip: string | null;
    color_category: string;
    tokens: string[] | null;
    popularity: number;
    cubeCount: number;
    pickCount: number;
};
declare const CardDetailsPropType: PropTypes.Requireable<PropTypes.InferProps<{
    color_identity: PropTypes.Validator<string[]>;
    set: PropTypes.Validator<string>;
    set_name: PropTypes.Validator<string>;
    foil: PropTypes.Validator<boolean>;
    nonfoil: PropTypes.Validator<boolean>;
    collector_number: PropTypes.Validator<string>;
    released_at: PropTypes.Validator<string>;
    reprint: PropTypes.Validator<boolean>;
    promo: PropTypes.Validator<boolean>;
    prices: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        usd: PropTypes.Requireable<number>;
        usd_foil: PropTypes.Requireable<number>;
        eur: PropTypes.Requireable<number>;
        tix: PropTypes.Requireable<number>;
    }>>>;
    elo: PropTypes.Validator<number>;
    digital: PropTypes.Validator<boolean>;
    isToken: PropTypes.Validator<boolean>;
    border_color: PropTypes.Validator<string>;
    name: PropTypes.Validator<string>;
    name_lower: PropTypes.Validator<string>;
    full_name: PropTypes.Validator<string>;
    artist: PropTypes.Requireable<string>;
    scryfall_uri: PropTypes.Validator<string>;
    rarity: PropTypes.Validator<string>;
    oracle_text: PropTypes.Requireable<string>;
    _id: PropTypes.Validator<string>;
    oracle_id: PropTypes.Validator<string>;
    cmc: PropTypes.Validator<number>;
    legalities: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        Legacy: PropTypes.Requireable<string>;
        Modern: PropTypes.Requireable<string>;
        Standard: PropTypes.Requireable<string>;
        Pauper: PropTypes.Requireable<string>;
        Pioneer: PropTypes.Requireable<string>;
        Brawl: PropTypes.Requireable<string>;
        Historic: PropTypes.Requireable<string>;
        Commander: PropTypes.Requireable<string>;
        Penny: PropTypes.Requireable<string>;
        Vintage: PropTypes.Requireable<string>;
    }>>>;
    parsed_cost: PropTypes.Validator<string[]>;
    colors: PropTypes.Requireable<string[]>;
    type: PropTypes.Requireable<string>;
    full_art: PropTypes.Validator<boolean>;
    language: PropTypes.Validator<string>;
    mtgo_id: PropTypes.Requireable<number>;
    layout: PropTypes.Validator<string>;
    tcgplayer_id: PropTypes.Requireable<number>;
    loyalty: PropTypes.Requireable<string>;
    power: PropTypes.Requireable<string>;
    toughness: PropTypes.Requireable<string>;
    image_small: PropTypes.Requireable<string>;
    image_normal: PropTypes.Requireable<string>;
    art_crop: PropTypes.Requireable<string>;
    image_flip: PropTypes.Requireable<string>;
    color_category: PropTypes.Validator<string>;
    tokens: PropTypes.Requireable<string[]>;
    popularity: PropTypes.Validator<number>;
    cubeCount: PropTypes.Validator<number>;
    pickCount: PropTypes.Validator<number>;
}>>;
import PropTypes from "prop-types";
//# sourceMappingURL=CardDetailsPropType.d.ts.map