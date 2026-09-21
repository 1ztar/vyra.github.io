# VYRA V12.1 — Liked Songs virtualization fix

Fixed a grid collision between the legacy `.simple-row` layout and the V12 windowed track list. The selection column had been taking the flexible track column while the actual track button was constrained to a narrow fixed column, pushing artwork/text to the far right and intercepting clicks.

The virtual row now has an explicit four-column layout (selection / track / duration / action), and the nested track button has its own artwork + text grid.
