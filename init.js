Games = new Meteor.Collection("games");
Maps = new Meteor.Collection("maps");

Armies = new Meteor.Collection("armies");
UnitCards = new Meteor.Collection("unitcards");
Units = new Meteor.Collection("units");

Actions = new Meteor.Collection("actions");

OBJECTIVE_SPRITE_PATH = "objective.png";
KLASS = "game-board";
DEMO = "demo-board";

SELECT = "." + KLASS;
CONTENT_WIDTH = 0.75;
CONTENT_MARGIN = 0.10;
MESSAGE_CHAR_WRAP = 20;
ROUND_MILLISECONDS = 3000;
TICK_MILLISECONDS = ROUND_MILLISECONDS / 60;
MOVE_MILLISECONDS = TICK_MILLISECONDS * 8;
MAX_MOVE = ROUND_MILLISECONDS * 0.3;
MAX_ASSAULT = ROUND_MILLISECONDS * 0.3;

DEPLOYMENT_ZONE_WIDTH = 3;

UNIT_SELECTED = "green";
ENEMY_SELECTED = "red";
UNIT_USED = "gray";
CAN_MOVE_TO = "lightgreen";
CAN_SEE = "lightblue";
CAN_ATTACK = "orange";
CAN_MOVE_TO_AND_SEE = "aquamarine";