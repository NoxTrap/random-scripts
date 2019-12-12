// Add more replies or edit them as you like. This is the only line you need to change if you want to add more.
var replies = ['shut up', 'nice killsay LOL', 'nice baim', 'you sell?'];


function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function onPlayerSay()
{
    local_name = Entity.GetName(Entity.GetLocalPlayer())  
    text = Event.GetString("text")
    userid = Event.GetInt("userid")
    chatter_name = Entity.GetName(Entity.GetEntityFromUserID(userid))
    if (text.indexOf(local_name) != -1)
    {
        if (text == local_name)
        {
            Cheat.ExecuteCommand("say what?")
        }
        rndword = replies[getRndInteger(0, replies.length)]
        Cheat.ExecuteCommand("say " + chatter_name + " " + rndword)
    }
}
Cheat.RegisterCallback("player_say", "onPlayerSay")

