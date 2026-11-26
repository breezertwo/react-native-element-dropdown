# Device checklist

Run before every beta and release, on a current iOS device or simulator and a
current Android device or emulator (Android: edge-to-edge is always on).

For every screen, check two things:

- **Visual:** what the screen's description says.
- **Screen reader:** the walkthrough below, once with VoiceOver (iOS) and once
  with TalkBack (Android).

## General screen reader expectations

These apply to every dropdown on every screen:

1. The field is announced with its label (or the placeholder), its value (the
   selected item, or "2 selected") and a role: "button" on iOS, "drop-down
   list" on Android. When open, iOS adds "expanded"; TalkBack says
   "expanded" / "collapsed".
2. Double-tap opens the list; focus moves into the list: the search field, or
   else the selected row (otherwise the first row).
3. Rows are announced with their label, "radio button" (Dropdown) or
   "checkbox" (MultiSelect), and "checked" / "unchecked". Selected rows also
   show a checkmark.
4. Swiping only moves through the list while it is open; nothing behind it is
   reachable.
5. Selecting an item (single select) closes the list and returns focus to the
   field, which now announces the new value.
6. Closing without selecting (iOS: two-finger scrub; Android: back) returns
   focus to the field.

## Screens

### Placement

- Visual: auto fields open downward near the top and upward near the bottom;
  forced positions never change; nothing covers the status bar or navigation bar.
- Screen reader: general expectations for all five fields.

### Search and keyboard

- Visual: the list stays above the keyboard while typing, and follows the
  keyboard when it changes height or closes.
- Screen reader: after opening, focus lands in the search field and it is
  announced as a search field with its placeholder. Typing filters the list;
  after a short pause the number of results is announced. The clear button
  is announced as "Clear search".

### Inside a Modal

- Visual: the list lines up with the field, with no gap or overlap the size of
  the status bar.
- Screen reader: general expectations; closing the list keeps focus inside the
  modal.

### Inside a ScrollView

- Visual: after scrolling to different positions, every list lines up with
  its field.
- Screen reader: general expectations for the first, a middle and the last field.

### Form sheet

- Visual: the list lines up with the field at both sheet heights.
- Screen reader: general expectations; the sheet's content behind the list is
  not reachable while the list is open.

### RTL and landscape

- Visual: in right-to-left mode and in landscape, the list lines up with the
  field, and text and icons are mirrored. Switch back to left-to-right when done.
- Screen reader: general expectations in both directions.

### MultiSelect

- Visual: chips match the selection; removing a chip deselects the item; the
  limited field stops at three items.
- Screen reader: rows are announced as checkboxes with their checked state;
  selecting or removing an item is announced ("Banana selected", "Banana
  removed"); every chip below the field is a button named "Remove <item>".
  With chips inside the field, the field offers "Remove <item>" as actions
  (iOS: actions rotor; Android: actions menu).

### Disabled items

- Visual: Banana, Kiwi and Mango are dimmed; pressing them does nothing. The
  Banana chip stays when pressed; the Apple chip removes Apple.
- Screen reader: disabled rows are announced as "dimmed" (iOS) or "disabled"
  (Android), and so is the Banana chip.

### Large list

- Visual: the list opens scrolled to item 750 without jumping back; scrolling
  is smooth.
- Screen reader: focus lands on "Item 750" when the list opens.

### Frozen data

- Visual: opening, searching and selecting work, and no error or warning
  appears.
- Screen reader: general expectations.

### Large text

- Visual: at the largest text size, nothing is cut off in the fields, list
  rows, search box or chips.
- Screen reader: general expectations at the largest text size.

### Country picker recipe

- Visual: the selected flag appears in the field; every row shows flag and name.
- Screen reader: flags are not announced; rows are announced by country name.
