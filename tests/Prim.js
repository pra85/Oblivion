/**
 * Created by Josh on 2/18/17.
 * File contains primitive tests
 */


var test = require("./TestMethods");

test.StdOutTest(1, "print(44)", "44\n");
test.StdOutTest(2, "print(add(3,3))", "6\n");
test.StdOutTest(3, "print(eq(3, 3))", "true\n");
test.StdOutTest(4, "print(eq(true, false))", "true\n");