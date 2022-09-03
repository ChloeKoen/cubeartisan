export default CubePreview;
declare function CubePreview({ cube }: {
    cube: any;
}): JSX.Element;
declare namespace CubePreview {
    namespace propTypes {
        const cube: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
            _id: import("prop-types").Validator<string>;
            name: import("prop-types").Validator<string>;
            shortID: import("prop-types").Validator<string>;
            owner: import("prop-types").Validator<string>;
            isListed: import("prop-types").Validator<boolean>;
            privatePrices: import("prop-types").Validator<boolean>;
            isFeatured: import("prop-types").Validator<boolean>;
            overrideCategory: import("prop-types").Validator<boolean>;
            categoryOverride: import("prop-types").Validator<string>;
            categoryPrefixes: import("prop-types").Validator<string[]>;
            cards: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                addedTmsp: import("prop-types").Requireable<NonNullable<string | Date | null | undefined>>;
                cardID: import("prop-types").Validator<string>;
                cmc: import("prop-types").Requireable<number>;
                colorCategory: import("prop-types").Requireable<string>;
                colors: import("prop-types").Requireable<(string | null | undefined)[]>;
                finish: import("prop-types").Validator<string>;
                imgBackUrl: import("prop-types").Requireable<string>;
                imgUrl: import("prop-types").Requireable<string>;
                index: import("prop-types").Requireable<number>;
                name: import("prop-types").Requireable<string>;
                notes: import("prop-types").Requireable<string>;
                rarity: import("prop-types").Requireable<string>;
                status: import("prop-types").Validator<string>;
                tags: import("prop-types").Validator<(string | null | undefined)[]>;
                type_line: import("prop-types").Requireable<string>;
                details: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                    color_identity: import("prop-types").Validator<string[]>;
                    set: import("prop-types").Validator<string>;
                    set_name: import("prop-types").Validator<string>;
                    foil: import("prop-types").Validator<boolean>;
                    nonfoil: import("prop-types").Validator<boolean>;
                    collector_number: import("prop-types").Validator<string>;
                    released_at: import("prop-types").Validator<string>;
                    reprint: import("prop-types").Validator<boolean>;
                    promo: import("prop-types").Validator<boolean>;
                    prices: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                        usd: import("prop-types").Requireable<number>;
                        usd_foil: import("prop-types").Requireable<number>;
                        eur: import("prop-types").Requireable<number>;
                        tix: import("prop-types").Requireable<number>;
                    }>>>;
                    elo: import("prop-types").Validator<number>;
                    digital: import("prop-types").Validator<boolean>;
                    isToken: import("prop-types").Validator<boolean>;
                    border_color: import("prop-types").Validator<string>;
                    name: import("prop-types").Validator<string>;
                    name_lower: import("prop-types").Validator<string>;
                    full_name: import("prop-types").Validator<string>;
                    artist: import("prop-types").Requireable<string>;
                    scryfall_uri: import("prop-types").Validator<string>;
                    rarity: import("prop-types").Validator<string>;
                    oracle_text: import("prop-types").Requireable<string>;
                    _id: import("prop-types").Validator<string>;
                    oracle_id: import("prop-types").Validator<string>;
                    cmc: import("prop-types").Validator<number>;
                    legalities: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                        Legacy: import("prop-types").Requireable<string>;
                        Modern: import("prop-types").Requireable<string>;
                        Standard: import("prop-types").Requireable<string>;
                        Pauper: import("prop-types").Requireable<string>;
                        Pioneer: import("prop-types").Requireable<string>;
                        Brawl: import("prop-types").Requireable<string>;
                        Historic: import("prop-types").Requireable<string>;
                        Commander: import("prop-types").Requireable<string>;
                        Penny: import("prop-types").Requireable<string>;
                        Vintage: import("prop-types").Requireable<string>;
                    }>>>;
                    parsed_cost: import("prop-types").Validator<string[]>;
                    colors: import("prop-types").Requireable<string[]>;
                    type: import("prop-types").Requireable<string>;
                    full_art: import("prop-types").Validator<boolean>;
                    language: import("prop-types").Validator<string>;
                    mtgo_id: import("prop-types").Requireable<number>;
                    layout: import("prop-types").Validator<string>;
                    tcgplayer_id: import("prop-types").Requireable<number>;
                    loyalty: import("prop-types").Requireable<string>;
                    power: import("prop-types").Requireable<string>;
                    toughness: import("prop-types").Requireable<string>;
                    image_small: import("prop-types").Requireable<string>;
                    image_normal: import("prop-types").Requireable<string>;
                    art_crop: import("prop-types").Requireable<string>;
                    image_flip: import("prop-types").Requireable<string>;
                    color_category: import("prop-types").Validator<string>;
                    tokens: import("prop-types").Requireable<string[]>;
                    popularity: import("prop-types").Validator<number>;
                    cubeCount: import("prop-types").Validator<number>;
                    pickCount: import("prop-types").Validator<number>;
                }>>>;
                isUnlimited: import("prop-types").Validator<boolean>;
            }>>[]>;
            maybe: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                addedTmsp: import("prop-types").Requireable<NonNullable<string | Date | null | undefined>>;
                cardID: import("prop-types").Validator<string>;
                cmc: import("prop-types").Requireable<number>;
                colorCategory: import("prop-types").Requireable<string>;
                colors: import("prop-types").Requireable<(string | null | undefined)[]>;
                finish: import("prop-types").Validator<string>;
                imgBackUrl: import("prop-types").Requireable<string>;
                imgUrl: import("prop-types").Requireable<string>;
                index: import("prop-types").Requireable<number>;
                name: import("prop-types").Requireable<string>;
                notes: import("prop-types").Requireable<string>;
                rarity: import("prop-types").Requireable<string>;
                status: import("prop-types").Validator<string>;
                tags: import("prop-types").Validator<(string | null | undefined)[]>;
                type_line: import("prop-types").Requireable<string>;
                details: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                    color_identity: import("prop-types").Validator<string[]>;
                    set: import("prop-types").Validator<string>;
                    set_name: import("prop-types").Validator<string>;
                    foil: import("prop-types").Validator<boolean>;
                    nonfoil: import("prop-types").Validator<boolean>;
                    collector_number: import("prop-types").Validator<string>;
                    released_at: import("prop-types").Validator<string>;
                    reprint: import("prop-types").Validator<boolean>;
                    promo: import("prop-types").Validator<boolean>;
                    prices: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                        usd: import("prop-types").Requireable<number>;
                        usd_foil: import("prop-types").Requireable<number>;
                        eur: import("prop-types").Requireable<number>;
                        tix: import("prop-types").Requireable<number>;
                    }>>>;
                    elo: import("prop-types").Validator<number>;
                    digital: import("prop-types").Validator<boolean>;
                    isToken: import("prop-types").Validator<boolean>;
                    border_color: import("prop-types").Validator<string>;
                    name: import("prop-types").Validator<string>;
                    name_lower: import("prop-types").Validator<string>;
                    full_name: import("prop-types").Validator<string>;
                    artist: import("prop-types").Requireable<string>;
                    scryfall_uri: import("prop-types").Validator<string>;
                    rarity: import("prop-types").Validator<string>;
                    oracle_text: import("prop-types").Requireable<string>;
                    _id: import("prop-types").Validator<string>;
                    oracle_id: import("prop-types").Validator<string>;
                    cmc: import("prop-types").Validator<number>;
                    legalities: import("prop-types").Validator<NonNullable<import("prop-types").InferProps<{
                        Legacy: import("prop-types").Requireable<string>;
                        Modern: import("prop-types").Requireable<string>;
                        Standard: import("prop-types").Requireable<string>;
                        Pauper: import("prop-types").Requireable<string>;
                        Pioneer: import("prop-types").Requireable<string>;
                        Brawl: import("prop-types").Requireable<string>;
                        Historic: import("prop-types").Requireable<string>;
                        Commander: import("prop-types").Requireable<string>;
                        Penny: import("prop-types").Requireable<string>;
                        Vintage: import("prop-types").Requireable<string>;
                    }>>>;
                    parsed_cost: import("prop-types").Validator<string[]>;
                    colors: import("prop-types").Requireable<string[]>;
                    type: import("prop-types").Requireable<string>;
                    full_art: import("prop-types").Validator<boolean>;
                    language: import("prop-types").Validator<string>;
                    mtgo_id: import("prop-types").Requireable<number>;
                    layout: import("prop-types").Validator<string>;
                    tcgplayer_id: import("prop-types").Requireable<number>;
                    loyalty: import("prop-types").Requireable<string>;
                    power: import("prop-types").Requireable<string>;
                    toughness: import("prop-types").Requireable<string>;
                    image_small: import("prop-types").Requireable<string>;
                    image_normal: import("prop-types").Requireable<string>;
                    art_crop: import("prop-types").Requireable<string>;
                    image_flip: import("prop-types").Requireable<string>;
                    color_category: import("prop-types").Validator<string>;
                    tokens: import("prop-types").Requireable<string[]>;
                    popularity: import("prop-types").Validator<number>;
                    cubeCount: import("prop-types").Validator<number>;
                    pickCount: import("prop-types").Validator<number>;
                }>>>;
                isUnlimited: import("prop-types").Validator<boolean>;
            }>>[]>;
            defaultDraftFormat: import("prop-types").Validator<number>;
            numDecks: import("prop-types").Validator<number>;
            description: import("prop-types").Requireable<string>;
            image_uri: import("prop-types").Requireable<string>;
            image_artist: import("prop-types").Requireable<string>;
            image_name: import("prop-types").Requireable<string>;
            owner_name: import("prop-types").Requireable<string>;
            date_updated: import("prop-types").Requireable<string>;
            updated_string: import("prop-types").Requireable<string>;
            defaultSorts: import("prop-types").Requireable<string[]>;
            default_show_unsorted: import("prop-types").Validator<boolean>;
            card_count: import("prop-types").Validator<number>;
            type: import("prop-types").Requireable<string>;
            users_following: import("prop-types").Validator<string[]>;
            defaultPrinting: import("prop-types").Requireable<string>;
            disableNotifications: import("prop-types").Validator<boolean>;
            schemaVersion: import("prop-types").Validator<number>;
            basics: import("prop-types").Validator<string[]>;
            tags: import("prop-types").Validator<string[]>;
            cardOracles: import("prop-types").Validator<string[]>;
            keywords: import("prop-types").Validator<string[]>;
            categories: import("prop-types").Validator<string[]>;
            raw_desc: import("prop-types").Validator<string>;
        }>>>;
    }
}
//# sourceMappingURL=CubePreview.d.ts.map