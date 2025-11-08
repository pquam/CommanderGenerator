This is a website where a user can generate a new legendary creature to use as a commander in magic the gathering.
The user inputs a mana cost (for example, WUBRG), then the app queries the scryfall API for all cards that match the color identities 
listed in the user's input. In this example, the query would look something like this:
```
https://api.scryfall.com/cards/search?as=grid&order=name&q=type:legendary%20color%3C=WUBRG%20(game:paper)
```

Then, the app picks x cards where x is the total converted mana cost input by the user.
get the rules text of the cards picked, then seperate the rules text of those cards by newline, and add each line to a rulestext list. 
Also add the names of those cards into a 'names' list and the creature types into a 'creaturetypes' list.
for each pip of mana in the users input, roll a 70% chance to add a line of rules text from the rulestext list to the new card.
every successful rulestext roll has 50% chance of removing either 1 power or 1 toughness (50/50). The starting power and toughness are each
equal to the starting converted mana cost.


The website will then generate a new card.
this will be accomplished by displaying an image of the appropriate color card frame,
then overlaying the frame with the mana cost, rules text, and power/toughness. 
The cards name, art, and creature types will be added later.

below the newly generated card will be a button labelled 'ReRoll' that will generate a new card using the same input
as the previous card, for this reason it may be adventagious to cache the previous scryfall api response.

