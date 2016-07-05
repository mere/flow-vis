
export const ERRORS = {
  invalidRootArgs:      'Invalid Argument. Please use a flow object as the root parameter'
, invalidTrackArgs:     'Invalid Argument. Please use the imported nFlow object as the track parameter'
, invalidOnChangeArgs:  'Invalid Argument. Please use a Function as the callback'
}

export const DIRECTION_BITMASK = {
  UPSTREAM: 1<<0,
  DOWNSTREAM: 1<<1,
}