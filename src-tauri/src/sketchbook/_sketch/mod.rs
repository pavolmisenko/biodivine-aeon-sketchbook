use crate::sketchbook::model::ModelState;
use crate::sketchbook::observations::ObservationManager;
use crate::sketchbook::properties::PropertyManager;
use crate::sketchbook::{JsonSerde, Manager};
use serde::{Deserialize, Serialize};

/// **(internal)** Implementation of event-based API for the [SessionState] trait.
mod _impl_session_state;
/// **(internal)** Utility methods for `Sketch`.
mod _impl_sketch;

/// Object encompassing all of the individual modules of the Boolean network sketch.
///
/// Most of the actual functionality is implemented by the modules themselves, `Sketch`
/// currently only distributes events and handles situations when cooperation between
/// modules is needed.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Sketch {
    model: ModelState,
    observations: ObservationManager,
    properties: PropertyManager,
}

impl<'de> JsonSerde<'de> for Sketch {}
impl Manager for Sketch {}

impl Default for Sketch {
    /// Default empty sketch.
    fn default() -> Sketch {
        Sketch {
            model: ModelState::default(),
            observations: ObservationManager::default(),
            properties: PropertyManager::default(),
        }
    }
}
