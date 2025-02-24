use crate::sketchbook::ids::{DynPropertyId, StatPropertyId};
use crate::sketchbook::properties::PropertyManager;
use crate::sketchbook::Manager;

/// Methods for safely generating new valid (unique) instances of identifiers for
/// the current `PropertyManager`.
impl PropertyManager {
    /// Generate valid `DynPropertyId` that's currently not used by any dynamic property in this
    /// `PropertyManager`.
    ///
    /// First, the given `ideal_id` or its transformation by replacing invalid characters are tried.
    /// If they are both invalid (non-unique), a numerical identifier is added at the end.
    ///
    /// **Warning:** Do not use this to pre-generate more than one id at a time, as the process
    /// is deterministic and might generate the same IDs. Always generate an Id, add that property,
    /// and then repeat for other properties.
    pub fn generate_dyn_property_id(&self, ideal_id: &str) -> DynPropertyId {
        self.generate_id(
            ideal_id,
            &(Self::is_valid_dyn_property_id),
            self.num_dyn_properties(),
        )
    }

    /// Generate valid `StatPropertyId` that's currently not used by any static property in this
    /// `PropertyManager`.
    ///
    /// First, the given `ideal_id` or its transformation by replacing invalid characters are tried.
    /// If they are both invalid (non-unique), a numerical identifier is added at the end.
    ///
    /// **Warning:** Do not use this to pre-generate more than one id at a time, as the process
    /// is deterministic and might generate the same IDs. Always generate an Id, add that property,
    /// and then repeat for other properties.
    pub fn generate_stat_property_id(&self, ideal_id: &str) -> StatPropertyId {
        self.generate_id(
            ideal_id,
            &(Self::is_valid_stat_property_id),
            self.num_stat_properties(),
        )
    }
}
