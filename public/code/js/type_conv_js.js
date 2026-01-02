Module = {}
Module.onRuntimeInitialized = function() {
  console.log(`print_int(123):`);
  _print_int(123)
  console.log(`print_int(23.45):`);
  _print_int(23.45)
  console.log(`print_float(123.456):`);
  _print_float(123.456)
  console.log(`print_float(1000000.23456789):`);
  _print_float(1000000.23456789)
  console.log(`print_float():`);
  _print_float()
  console.log(`print_int():`);
  _print_int()
}