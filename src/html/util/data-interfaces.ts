import { type Position } from 'cytoscape'
import { Data } from 'dataclass'

export interface IVariableData {
  id: string
  name: string
  function: string
}

export enum ElementType {
  NONE,
  EDGE,
  NODE
}

export enum Monotonicity {
  UNSPECIFIED = 'Unknown',
  ACTIVATION = 'Activation',
  INHIBITION = 'Inhibition',
  DUAL = 'Dual'
}

export enum Essentiality {
  FALSE = 'False',
  TRUE = 'True',
  UNKNOWN = 'Unknown'
}

export enum DataCategory {
  ATTRACTOR = 'Attractor',
  FIXEDPOINT = 'FixedPoint',
  TIMESERIES = 'TimeSeries',
  UNSPECIFIED = 'Unspecified',
}

export interface IRegulationData {
  id: string
  source: string
  target: string
  essential: Essentiality
  monotonicity: Monotonicity
}

export type ILayoutData = Map<string, Position>

export class ContentData extends Data {
  variables: IVariableData[] = []
  functions: IFunctionData[] = []
  layout: ILayoutData = new Map()
  regulations: IRegulationData[] = []
  observations: IObservationSet[] = []
}

export interface IFunctionData {
  id: string
  function: string
  variables: IRegulationData[]
}

export interface IObservation {
  selected: boolean
  id: string
  name: string
  [key: string]: string | number | boolean
}

export interface IObservationSet {
  id: string
  observations: IObservation[]
  variables: string[]
  category: DataCategory
}

export enum StaticPropertyType {
  Generic,
  FunctionInputEssential,
  FunctionInputMonotonic
}

export enum DynamicPropertyType {
  Generic,
  FixedPoint,
  TrapSpace,
  ExistsTrajectory,
  AttractorCount,
  HasAttractor
}
export interface IProperty {
  id: string
  name: string
  type: DynamicPropertyType | StaticPropertyType
}

export interface IFixedPointDynamicProperty extends IProperty {
  dataset: string
  observation: string
}

export interface ITrapSpaceDynamicProperty extends IProperty {
  dataset: string
  observation: string
  minimal: boolean
  nonpercolable: boolean
}

export interface IExistsTrajectoryProperty extends IProperty {
  dataset: string
}

export interface IAttractorCount extends IProperty {
  lower: number
  upper: number
}

export interface IHasAttractorProperty extends IProperty {
  dataset: string
  observation: string
}

export interface IGenericStaticProperty extends IProperty {
  value: string
}
