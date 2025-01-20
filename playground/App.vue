<php>
    $string = "foo";
    $number = 1;
    $boolean = true;
    $nullish = null;
    $array = [];
    export($string, $number, $boolean, $nullish, $array);
</php>

<template>
    {{ string }}
    <!-- ^? -->
    {{ number }}
    <!-- ^? -->
    {{ boolean }}
    <!-- ^? -->
    {{ nullish }}
    <!-- ^? -->
    {{ array }}
    <!-- ^? -->
</template>