use crate::sketchbook::ids::{LayoutId, UninterpretedFnId, VarId};
use crate::sketchbook::model::ModelState;
use crate::sketchbook::Manager;

/// Methods for safely generating valid instances of identifiers for the current `ModelState`.
impl ModelState {
    /// Generate valid `VarId` that's currently not used by any variable in this `ModelState`.
    ///
    /// First, the given `ideal_id` or its transformation by replacing invalid characters are tried.
    /// If they are both invalid (non-unique), a numerical identifier is added at the end.
    ///
    /// **Warning:** Do not use this to pre-generate more than one id at a time, as the process
    /// is deterministic and might generate the same IDs. Always generate an Id, add that variable to
    /// the model, and then repeat for other variables.
    pub fn generate_var_id(&self, ideal_id: &str) -> VarId {
        self.generate_id(ideal_id, &(Self::is_valid_var_id), self.num_vars())
    }

    /// Generate valid `LayoutId` that's currently not used by layouts in this `ModelState`.
    ///
    /// First, the given `ideal_id` or its transformation by replacing invalid characters are tried.
    /// If they are both invalid (non-unique), a numerical identifier is added at the end.
    ///
    /// **Warning:** Do not use this to pre-generate more than one id at a time, as the process
    /// is deterministic and might generate the same IDs. Always generate an Id, add that layout to
    /// the model, and then repeat for other layouts.
    pub fn generate_layout_id(&self, ideal_id: &str) -> LayoutId {
        self.generate_id(ideal_id, &(Self::is_valid_layout_id), self.num_layouts())
    }

    /// Generate valid `UninterpretedFnId` that's currently not used by uninterpreted_fns in this `ModelState`.
    ///
    /// First, the given `ideal_id` or its transformation by replacing invalid characters are tried.
    /// If they are both invalid (non-unique), a numerical identifier is added at the end.
    ///
    /// **Warning:** Do not use this to pre-generate more than one id at a time, as the process
    /// is deterministic and might generate the same IDs. Always generate an Id, add that fn to
    /// the model, and then repeat for other fns.
    pub fn generate_uninterpreted_fn_id(&self, ideal_id: &str) -> UninterpretedFnId {
        self.generate_id(
            ideal_id,
            &(Self::is_valid_uninterpreted_fn_id),
            self.num_uninterpreted_fns(),
        )
    }
}

#[cfg(test)]
mod tests {
    use crate::sketchbook::ids::{LayoutId, VarId};
    use crate::sketchbook::model::ModelState;

    #[test]
    fn test_var_id_generating() {
        let model =
            ModelState::new_from_vars(vec![("a", "name"), ("b", "name"), ("c", "name")]).unwrap();
        assert_eq!(model.num_vars(), 3);

        // name slice that is a valid identifier as is
        let var_name_1 = "d";
        assert_eq!(model.generate_var_id(var_name_1), VarId::new("d").unwrap());

        // name that is not a valid identifier as it contains various invalid characters
        let var_name_2 = "-d ??)&    ";
        assert_eq!(model.generate_var_id(var_name_2), VarId::new("d").unwrap());

        // name that is already used in the network
        let var_name_3 = "a";
        // result will contain an numerical index in the end
        assert_eq!(
            model.generate_var_id(var_name_3),
            VarId::new("a_0").unwrap()
        );

        // name that starts with a number - will be cleaned and prefixed with "v_"
        let var_name_4 = "4ab??";
        // result will contain an numerical index in the end
        assert_eq!(
            model.generate_var_id(var_name_4),
            VarId::new("v_4ab").unwrap()
        );
    }

    #[test]
    fn test_layout_id_generating() {
        let mut model = ModelState::new_empty();
        let layout_id = LayoutId::new("l_0").unwrap();
        let default_layout_id = ModelState::get_default_layout_id();
        model.add_layout_simple(layout_id, "name").unwrap();
        assert_eq!(model.num_layouts(), 2);

        // expected result for all the following IDs will be the same
        let expected = LayoutId::new("l_1").unwrap();

        // name slice that is a valid identifier as is
        let name_1 = "l_1";
        assert_eq!(model.generate_layout_id(name_1), expected);

        // name that is not a valid identifier as it contains various invalid characters
        let name_2 = "%%%%l_    1)";
        assert_eq!(model.generate_layout_id(name_2), expected);

        // add new layout
        let layout_id = LayoutId::new("l").unwrap();
        model
            .add_layout_copy(layout_id, "name", &default_layout_id)
            .unwrap();

        // try generate ID for the same layout again - the result will have numerical index appended
        // however, this time we cant just add index 0 because the result would not be unique

        let name_3 = "l";
        // search for unused index is incremental, starting at 0 (until valid index 1 is found)
        assert_eq!(model.generate_layout_id(name_3), expected);
    }
}
