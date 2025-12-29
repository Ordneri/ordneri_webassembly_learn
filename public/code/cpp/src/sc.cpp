#include <stdio.h>

int add(int a, int b)
{
    return a + b;
}

int main()
{
    printf("Hello WebAssembly!\n");
    int a = 1;
    int b = 2;
    int c = add(a, b);
    printf("add(%d,%d) = %d\n", a, b, c);
    return 0;
}