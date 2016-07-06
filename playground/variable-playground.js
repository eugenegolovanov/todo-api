
// //Object Example
// var person = {
// 	name: 'Eugene',
// 	age: 33
// };


// function updatePerson (obj) {
// 	// obj =  {
// 	// 	name: 'Eugene',
// 	// 	age: 5
// 	// }// Don't assign value to passed object, it creates separate variable

// 	obj.name = 'Peter';// assign value to passed object because I call something from the original
// }


// updatePerson(person);
// console.log(person);


//Array Example
var arr = ['pizza', 'chips', 'porchuto'];

function updateArray(array) {

	// array = ['wall', 'floor'];//Doesn't do anything with original, it creates separate variable

	array = arr.push('shit');// works because I modify value

	debugger;//Break Point, just like blue mark in xCode
}

updateArray(arr);
console.log(arr);