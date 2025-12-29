mergeInto(LibraryManager.library, {
    js_fib: function(n) {
        if (n < 2) return n;
        return js_fib(n-1) + js_fib(n-2);
    }
});