use crate::sketchbook::layout::Layout;

/// **(internal)** Utility methods for `BinaryOp`.
mod _binary_op;
/// **(internal)** Utility methods for `Essentiality`.
mod _essentiality;
/// **(internal)** Utility methods for `FnTree`.
mod _function_tree;
/// **(internal)** Classes and utility methods regarding the type-safe identifiers for
/// various components.
mod _identifiers;
/// **(internal)** Utility methods for `ModelState`.
mod _model;
/// **(internal)** Utility methods for `Monotonicity`.
mod _monotonicity;
/// **(internal)** Utility methods for `Regulation`.
mod _regulation;
/// **(internal)** Utility methods for `UninterpretedFn`.
mod _uninterpreted_fn;
/// **(internal)** Utility methods for `FnArgument`.
mod _uninterpreted_fn_arg;
/// **(internal)** Utility methods for `UpdateFn`.
mod _update_function;
/// **(internal)** Utility methods for `Variable`.
mod _variable;

/// Classes and utility methods that can be used for sending simplified data to frontend.
/// This includes simplified "data carriers" for variables, regulations, and layouts.
pub mod data_structs;
/// Classes and utility methods regarding the layout of the Regulations editor.
pub mod layout;
/// Classes and utility methods regarding the observations.
pub mod observations;
/// Classes and utility methods regarding the properties.
pub mod properties;
/// Utility functions used throughout the module.
pub mod utils;

pub use _binary_op::BinaryOp;
pub use _essentiality::Essentiality;
pub use _function_tree::FnTree;
pub use _identifiers::{DatasetId, LayoutId, ObservationId, PropertyId, UninterpretedFnId, VarId};
pub use _model::ModelState;
pub use _monotonicity::Monotonicity;
pub use _regulation::Regulation;
pub use _uninterpreted_fn::UninterpretedFn;
pub use _uninterpreted_fn_arg::FnArgument;
pub use _update_function::UpdateFn;
pub use _variable::Variable;

/// An iterator over all (`VarId`, `Variable`) pairs of a `ModelState`.
pub type VariableIterator<'a> = std::collections::hash_map::Iter<'a, VarId, Variable>;

/// An iterator over all (`UninterpretedFnId`, `UninterpretedFn`) pairs of a `ModelState`.
pub type UninterpretedFnIterator<'a> =
    std::collections::hash_map::Iter<'a, UninterpretedFnId, UninterpretedFn>;

/// An iterator over all `Regulations` of a `ModelState`.
pub type RegulationIterator<'a> = std::collections::hash_set::Iter<'a, Regulation>;

/// An iterator over all (`LayoutId`, `Layout`) pairs of a `ModelState`.
pub type LayoutIterator<'a> = std::collections::hash_map::Iter<'a, LayoutId, Layout>;
