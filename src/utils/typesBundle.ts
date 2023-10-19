import type {
  OverrideBundleType,
} from "@polkadot/types/types";

export const typesBundle = {
  "spec": {
    "imbue": {
      "rpc": {
        "proposals": {
          "getAllProjectData": {
            "description": "Get aggregated project data",
            "params": [
              {
                "name": "project_id",
                "type": "u32"
              }
            ],
            "type": "Option<(Vec<u8>, Vec<u8>)>"
          },
          "getProjectKitty": {
            "description": "Get the escrow address associated with a project",
            "params": [
              {
                "name": "project_id",
                "type": "u32"
              }
            ],
            "type": "AccountId"
          }
        }
      },
      "types": [
        {
          "minmax": [
            0,
            null
          ],
          "types": {
            "Address": "MultiAddress",
            "LookupSource": "MultiAddress",
            "Sam": "Vec<u8>",
            "Project": {
              "agreement_hash": "H256",
              "milestones": "BTreeMap<u32, Milestone>",
              "contributions": "BTreeMap<AccountId, Contribution>",
              "withdrawn_funds": "Balance",
              "raised_funds": "Balance",
              "initiator": "AccountId",
              "created_on": "BlockNumber",
              "cancelled": "bool",
              "funding_type": "Vec<u8>",
              "currency_id": "u32",
              "deposit_id": "u32"
            },
            "Milestone": {
              "project_key": "u32",
              "milestone_key": "u32",
              "percentage_to_unlock": "Percent",
              "is_approved": "bool"
            },
            "Contribution": {
              "value": "Balance",
              "timestamp": "BlockNumber"
            },
            "ImmutableIndividualVotes": { "inner": "BTreeMap<u32, BTreeMap<AccountId, bool>>" },
          }
        }
      ]
    }
  },
} as OverrideBundleType;