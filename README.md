angular mobile
======

An light weight two-way data bind template engine like angularjs!

usage:

Bind

bind the node and data. when data change, node will change.

$(node).bind( /*string*/ value, /*json*/ data, /*string*/ path)

value

Text node - only handles bindings on its textContent property.
HTMLInputElement - handles bindings on its value and checked properties.
HTMLTextareaElement - handles bindings on its value property.
HTMLSelectElement - handles bindings on its selectedIndex property.

Render

$(node).render()

Parse

$.parse(node)

Init

$.init()


