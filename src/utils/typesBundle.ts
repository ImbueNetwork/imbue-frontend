import type {
    OverrideBundleDefinition,
    OverrideBundleType,
} from "@polkadot/types/types";

export const imbueDefinitions = {
    rpc: {
        proposals: {
            getAllProjectData: {
                description: "Get aggregated project data",
                params: [
                    {
                        name: "project_id",
                        type: "u32",
                    }
                ],
                type: "Option<(Vec<u8>, Vec<u8>, Vec<u8>, Vec<u8>, Vec<u32>)>"
            },
            getProjectKitty: {
                description: "Get the escrow address associated with a project",
                params: [
                    {
                        "name": "project_id",
                        "type": "u32"
                    }
                ],
                type: "AccountId"
            }
        }
    },
    types: [
        {
            minmax: [
                0,
                null
            ],
            types: {
                Address: "MultiAddress",
                LookupSource: "MultiAddress",
                Project: {
                    agreement_hash: "H256",
                    milestones: "BTreeMap<u32, Milestone>",
                    contributions: "BTreeMap<AccountId, Contribution>",
                    currencyId: "CurrencyId",
                    withdrawn_funds: "Balance",
                    raised_funds: "Balance",
                    initiator: "AccountId",
                    created_on: "BlockNumber",
                    cancelled: "bool",
                    deposit_id: "u32",
                    refund_locations: "Vec<u8>",
                    jury:"BoundedVec<AccountId,u32>",
                    onCreationFunding: "Vec<u8>",
                    refunded_funds: "Balance",
                },
                ForeignAssetId: {
                    _enum: [
                        "ETH",
                        "USDT",
                    ]
                },
                CurrencyId: {
                    _enum: {
                        Native: "u32",
                        KSM: "u32",
                        AUSD: "u32",
                        KAR: "u32",
                        MGX: "u32",
                        ForeignAsset: "ForeignAssetId"
                    }
                },
                ForeignOwnedAccount: {
                    _enum: {
                        TRON: "Vec<u8>",
                        ETH: "Vec<u8>",
                    }
                },
                Milestone: {
                    project_key: "u32",
                    milestone_key: "u32",
                    percentage_to_unlock: "Percent",
                    is_approved: "bool",
                    can_refund: "bool",
                    transfer_status: "Option<TransferStatus>"
                },
                TransferStatus: {
                    refunded: "BlockTimestamp",
                    withdrawn: "BlockTimestamp"
                },
                BlockTimestamp: {
                    on: "BlockNumber"
                },

                Contribution: {
                    value: "Balance",
                    timestamp: "BlockNumber"
                },
                ImmutableIndividualVotes: { "votes": "BTreeMap<u32, BTreeMap<AccountId, bool>>" },
            },
        }
    ]
} as OverrideBundleDefinition;

export const typesBundle = {
    spec: {
        imbue: imbueDefinitions
    },
} as OverrideBundleType;