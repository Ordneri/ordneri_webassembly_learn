#include <emscripten/emscripten.h>
#include <stdio.h>
EM_JS(void, two_logs, (), {
  console.log('hai');
  console.log('bai');
});

EM_JS(void, take_args, (int x, float y),
      { console.log('I received: ' + [ x, y ]); });

EM_JS(void, say_hello, (const char *str),
      { console.log('hello ' + UTF8ToString(str)); })

EM_JS(void, read_data, (int *data), {
  console.log('Data: ' + HEAP32[data >> 2] + ', ' + HEAP32[(data + 4) >> 2]);
})

EM_JS(int, add_forty_two, (int n), { return n + 42; });

EM_JS(int, get_memory_size, (), { return HEAP8.length; });

EM_JS(char *, get_unicode_str, (), {
  var jsString =
      'Hello with some exotic Unicode characters: Tässä on yksi lumiukko: ☃, ole hyvä.';
  // 'jsString.length' would return the length of the string as UTF-16
  // units, but Emscripten C strings operate as UTF-8.
  return stringToNewUTF8(jsString);
});


int main() {
  two_logs();
  take_args(100, 35.5);
  int arr[2] = {30, 45};
  read_data(arr);
  int x = add_forty_two(100);
  int y = get_memory_size();
  printf("add_forty_two(100) = %d\n", x);
  printf("get_memory_size() = %d\n", y);

  char* str = get_unicode_str();
  printf("UTF8 string says: %s\n", str);
  // Each call to _malloc() must be paired with free(), or heap memory will leak!
  free(str);
  return 0;
}