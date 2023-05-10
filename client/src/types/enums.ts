export enum RequestMethodE {
  Get = 'GET',
  Delete = 'DELETE',
  Post = 'POST',
  Put = 'PUT',
}

export enum OrderBlockE {
  Long = 'Long',
  Short = 'Short',
}

export enum OrderTypeE {
  Market = 'Market',
  Limit = 'Limit',
  Stop = 'Stop',
}

export enum ExpiryE {
  '1D' = '1D',
  '30D' = '30D',
  '60D' = '60D',
  '90D' = '90D',
  '180D' = '180D',
  '365D' = '365D',
}

export enum StopLossE {
  '10%' = '-10%',
  '25%' = '-25%',
  '50%' = '-50%',
  '75%' = '-75%',
  '90%' = '-90%',
  'None' = 'NONE',
}

export enum TakeProfitE {
  '25%' = '25%',
  '50%' = '50%',
  '100%' = '100%',
  '300%' = '300%',
  '900%' = '900%',
  'None' = 'NONE',
}

export enum ToleranceE {
  '0.1%' = 0.1,
  '0.5%' = 0.5,
  '1%' = 1,
  '1.5%' = 1.5,
  '2%' = 2,
  '3%' = 3,
  '4%' = 4,
  '5%' = 5,
}

export enum AlignE {
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Inherit = 'inherit',
  Justify = 'justify',
}

export enum TvChartPeriodE {
  '1Min' = '1m',
  '5Min' = '5m',
  '15Min' = '15m',
  '1Hour' = '1h',
  '1Day' = '1d',
}
