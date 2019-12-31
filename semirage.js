var local = Entity.GetLocalPlayer();
var shot_time = 0;
var binlib = {};
var prev_angle = undefined;
var correct = false;
var pos = [];
var canShoot = false;
var sens = Convar.GetFloat("sensitivity");
var shooting = false;
var temp = -1;
var targets = ["Off"];
var wepList = {
    0: "Auto",
    1: "AWP",
    2: "Scout",
    3: "Rifle",
    4: "SMG",
    5: "Heavy Pistol",
    6: "Pistol",
    7: "Heavy"
};

function getAngles(localPos, pos)
{
    newPos = vector_sub(pos, localPos);
    xyDist = Math.sqrt((newPos[0] * newPos[0] + newPos[1] * newPos[1]));
    yaw = Math.atan2(newPos[1], newPos[0]) * 180 / Math.PI;
    pitch = Math.atan2(-newPos[2], xyDist) * 180 / Math.PI;
    roll = 0;
    angles = [pitch, yaw, roll];
    return angles;
}

function getVec(pitch, yaw)
{
    var p = deg2Rad(pitch);
    var y = deg2Rad(yaw)
    var sin_p = Math.sin(p);
    var cos_p = Math.cos(p);
    var sin_y = Math.sin(y);
    var cos_y = Math.cos(y);
    return [cos_p * cos_y, cos_p * sin_y, -sin_p];
}

function vector_sub(vec1, vec2)
{
    return [
        vec1[0] - vec2[0],
        vec1[1] - vec2[1],
        vec1[2] - vec2[2]
    ];
}

function vector_add(vec, vec2)
{
    newVec = [
        vec[0] + vec2[0],
        vec[1] + vec2[1],
        vec[2] + vec2[2]
    ]
    return newVec;
}

function rad2deg(rad)
{
    return rad * 180 / Math.PI;
}

function deg2Rad(angle)
{
    return angle * Math.PI / 180;
}
setup();

function setup()
{
    Cheat.PrintColor([255, 0, 0, 255],
        " ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___ \n");
    Cheat.PrintColor([255, 0, 0, 255],
        "(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)\n");
    Cheat.PrintColor([255, 0, 0, 255], "\n");
    Cheat.PrintColor([255, 0, 0, 255],
        " ___  ____  __  __  ____           ____    __    ___  ____    ____  _____  ____ \n");
    Cheat.PrintColor([255, 0, 0, 255],
        "/ __)( ___)(  \\/  )(_  _)   ___   (  _ \\  /__\\  / __)( ___)  (  _ \\(  _  )(_  _)\n");
    Cheat.PrintColor([255, 0, 0, 255],
        "\\__ \\ )__)  )    (  _)(_   (___)   )   / /(__)\\( (_-. )__)    ) _ < )(_)(   )(  \n");
    Cheat.PrintColor([255, 0, 0, 255],
        "(___/(____)(_/\\/\\_)(____)         (_)\\_)(__)(__)\\___/(____)  (____/(_____) (__) \n");
    Cheat.PrintColor([255, 0, 0, 255], " _  _    __    ___  \n");
    Cheat.PrintColor([255, 0, 0, 255], "( \\/ )  /  )  / _ \\ \n");
    Cheat.PrintColor([255, 0, 0, 255], " \\  /    )(  ( (_) ) \n");
    Cheat.PrintColor([255, 0, 0, 255], "  \\/    (__)()\\___/ \n");
    Cheat.PrintColor([255, 0, 0, 255], " ____  _  _    __  __  __   ____  ____    __    _  _  ____  ____  ____ \n");
    Cheat.PrintColor([255, 0, 0, 255],
    "(  _ \\( \\/ )  (  )(  )(  ) (_  _)(  _ \\  /__\\  ( \\( )(_  _)(_  _)( ___)\n");
    Cheat.PrintColor([255, 0, 0, 255], " ) _ < \\  /    )(__)(  )(__  )(   )   / /(__)\\  )  (  _)(_   )(   )__) \n");
    Cheat.PrintColor([255, 0, 0, 255], "(____/ (__)   (______)(____)(__) (_)\\_)(__)(__)(_)\\_)(____) (__) (____)\n");
    Cheat.PrintColor([255, 0, 0, 255], "\n");
    Cheat.PrintColor([255, 0, 0, 255],
        " ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___  ___ \n");
    Cheat.PrintColor([255, 0, 0, 255],
        "(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)\n");
    UI.AddLabel("---------------v---------------");
    UI.AddCheckbox("Enable Semi-Rage");
    UI.AddLabel("-------------------------------");
    enabled = UI.GetValue("Enable Semi-Rage");
    UI.AddHotkey("Semi-Rage Key");
    UI.AddColorPicker("FOV Color");
    UI.SetEnabled("FOV Color", enabled);
    createDropdown("[SR] Enabled Weapons", ["Auto", "AWP", "Scout", "Rifle", "SMG", "Heavy Pistol", "Pistol", "Heavy"],
        true);
    UI.SetEnabled("[SR] Enabled Weapons", enabled);
    opts = fetchDropdown("[SR] Enabled Weapons");
    enemies = Entity.GetEnemies();
    for (enemy in enemies)
    {
        targets.push(enemies[enemy] + " | " + Entity.GetName(enemies[enemy]));
    }
    UI.SetEnabled("[SR] Target Priority", enabled);
    UI.AddDropdown("[SR] Target Priority", targets);
    UI.AddDropdown("[SR] Weapon Config", ["Auto", "AWP", "Scout", "Rifle", "SMG", "Heavy Pistol", "Pistol", "Heavy"]);
    UI.SetEnabled("[SR] Weapon Config", enabled);
    for (wep in wepList)
    {
        weapon = wepList[wep];
        UI.AddSliderInt(weapon + " FOV", 0, 80);
        UI.AddSliderInt(weapon + " Min Damage", 0, 100);
        UI.AddSliderFloat(weapon + " Max Inaccuracy", 0, 1200);
        UI.SetEnabled(weapon + " Min Damage", enabled);
        UI.SetEnabled(weapon + " Max Inaccuracy", enabled);
        UI.SetEnabled(weapon + " FOV", enabled);
    }
}

function updateMenu()
{
    enabled = UI.GetValue("Enable Semi-Rage");
    opts = fetchDropdown("[SR] Enabled Weapons");
    conf = UI.GetString("Script items", "[SR] Weapon Config");
    UI.SetEnabled("[SR] Enabled Weapons", enabled);
    UI.SetEnabled("[SR] Weapon Config", enabled);
    UI.SetEnabled("FOV Color", enabled);
    targets = [];
    for (enemy in enemies)
    {
        targets.push(enemies[enemy] + " | " + Entity.GetName(enemies[enemy]));
    }
    UI.SetValue("[SR] Target Priority", targets);
    UI.SetEnabled("[SR] Target Priority", enabled);
    for (wep in wepList)
    {
        weapon = wepList[wep];
        UI.SetEnabled(weapon + " Min Damage", enabled && conf == weapon);
        UI.SetEnabled(weapon + " Max Inaccuracy", enabled && conf == weapon);
        UI.SetEnabled(weapon + " FOV", enabled && conf == weapon);
    }
}

function drawFOV()
{
    if (!UI.GetValue("Script items", "Enable Semi-Rage") || fetchDropdown("[SR] Enabled Weapons").indexOf(
    weaponType()) == -1)
        return;
    weapon = weaponType();
    radius = resizeFOV(weapon);
    color = UI.GetColor("Script items", "FOV Color");
    Render.Circle(width / 2, height / 2, radius, color);
}

function resizeFOV(weapon)
{
    width = Render.GetScreenSize()[0];
    height = Render.GetScreenSize()[1];
    mon_fov = (width / height / (4.0 / 3.0));
    fov_real = rad2deg(2 * Math.atan(mon_fov * Math.tan(deg2Rad(UI.GetValue("Visual", "WORLD", "View",
        "Field of view")) / 2)));
    radius = Math.tan(deg2Rad(UI.GetValue("Script items", weapon + " FOV") / 2) / Math.tan(deg2Rad(fov_real) / 2)) *
        width;
    return radius;
}

function aim()
{
    if (!UI.IsHotkeyActive("Script items", "Semi-Rage Key") || fetchDropdown("[SR] Enabled Weapons").indexOf(
        weaponType()) == -1 || UI.IsMenuOpen()) return;
    if (Cheat.FrameStage() == 0)
    {
        if (Globals.Curtime() < Entity.GetProp(Entity.GetWeapon(Entity.GetLocalPlayer()), "CBaseCombatWeapon",
                "m_flNextPrimaryAttack"))
        {
            Cheat.ExecuteCommand("-attack");
            return;
        }
        head = Entity.GetProp(local, "CBasePlayer", "m_vecOrigin");
        offset = Entity.GetProp(local, "CBasePlayer", "m_vecViewOffset[2]");
        eye_local = vector_add(head, [0, 0, offset[0]]);
        prev_angle = Local.GetViewAngles();
        if (Convar.GetFloat("sensitivity") > 0.1) sens = Convar.GetFloat("sensitivity");
        angles = getAngles(eye_local, pos);
        if (canShoot)
        {
            Convar.SetFloat("sensitivity", 0);
            Cheat.ExecuteCommand("+attack");
            Local.SetViewAngles(angles);
            correct = true;
            canShoot = false;
            temp = -1;
        }
        else
        {
            temp = -1;
        }
    }
    else
    {
        Convar.SetFloat("sensitivity", sens);
        Cheat.ExecuteCommand("-attack");
        if (!correct) return;
        Local.SetViewAngles(prev_angle);
        correct = !correct;
        temp = -1;
        pos = [];
    }
}

function calcEnemy()
{
    if (!Entity.IsAlive(local) || World.GetMapName() == "" || fetchDropdown("[SR] Enabled Weapons").indexOf(
        weaponType()) == -1)
        return;
    head = Entity.GetProp(local, "CBasePlayer", "m_vecOrigin");
    offset = Entity.GetProp(local, "CBasePlayer", "m_vecViewOffset[2]");
    eye_local = vector_add(head, [0, 0, offset[0]]);
    weapon = weaponType();
    enemies = Entity.GetEnemies();
    realPos = 0;
    poses = [];
    width = Render.GetScreenSize()[0];
    height = Render.GetScreenSize()[1];
    radius = resizeFOV(weapon);
    damage = UI.GetValue("Script items", weapon + " Min Damage");
    max_recoil = UI.GetValue("Script items", weapon + " Max Inaccuracy");
    recoil = getRecoil();
    priority = UI.GetValue("[SR] Target Priority");
    priorityTarget = UI.GetString("[SR] Target Priority");
    priorityTarget = priorityTarget.substring(0, 1);
    priorityTarget = parseInt(priorityTarget, 10);
    for (enemy in enemies)
    {
        if (!Entity.IsAlive(enemies[enemy]) || Entity.IsDormant(enemies[enemy]) || !Entity.IsValid(enemies[enemy]))
        {
            continue;
        }
        currPos = Render.WorldToScreen(Entity.GetHitboxPosition(enemies[enemy], 0));
        currDistance = distance(currPos, [width / 2, height / 2]);
        if (currDistance <= radius)
        {
            if (enemies[enemy] == priorityTarget)
            {
                poses.push([enemies[enemy], 1]);
                break;
            }
            else
            {
                poses.push([enemies[enemy], currDistance]);
            }
        }
    }
    if (poses[0] != [] && poses.length > 0)
    {
        poses.sort(function(a, b)
        {
            return a[1] - b[1];
        });
        if (poses[0][0] == undefined || poses[0][1] == undefined)
            return canShoot = false;
        trace_head = Trace.Bullet(local, eye_local, Entity.GetHitboxPosition(poses[0][0], 0));
        trace_stomach = Trace.Bullet(local, eye_local, Entity.GetHitboxPosition(poses[0][0], 5));
        if (recoil < max_recoil)
        {
            if (trace_head[1] > trace_stomach[1] && trace_head[1] > damage)
            {
                canShoot = true;
                pos = Entity.GetHitboxPosition(poses[0][0], 0);
            }
            else if (trace_stomach[1] > damage)
            {
                canShoot = true;
                pos = Entity.GetHitboxPosition(poses[0][0], 5);
            }
        }
        else
        {
            canShoot = false;
            pos = [];
        }
    }
}

function distance(pos1, pos2)
{
    x = pos1[0];
    y = pos1[1];
    x1 = pos2[0];
    y1 = pos2[1];
    return Math.sqrt(((x - x1) * (x - x1)) + ((y - y1) * (y - y1)));
}

function getRecoil()
{
    inacc = Local.GetInaccuracy();
    spread = Local.GetSpread();
    recoil = 501 * (inacc * (6000 * spread));
    return recoil;
}

function weaponType()
{
    var weapon = Entity.GetName(Entity.GetWeapon(local));
    var weapons = {
        "usp s": "Pistol",
        "glock 18": "Pistol",
        "p2000": "Pistol",
        "dual berettas": "Pistol",
        "r8 revolver": "Heavy Pistol",
        "desert eagle": "Heavy Pistol",
        "p250": "Pistol",
        "tec 9": "Pistol",
        "five seven": "Pistol",
        "mp9": "SMG",
        "mac 10": "SMG",
        "ump 45": "SMG",
        "ak 47": "Rifle",
        "sg 553": "Rifle",
        "aug": "Rifle",
        "m4a1 s": "Rifle",
        "m4a4": "Rifle",
        "ssg 08": "Scout",
        "awp": "AWP",
        "g3sg1": "Auto",
        "scar 20": "Auto",
        "nova": "Heavy",
        "xm1014": "Heavy",
        "mag 7": "Heavy",
        "m249": "Heavy",
        "negev": "Heavy"
    };
    if (weapons[weapon] == undefined)
        return "";
    return weapons[weapon];
}

function dictLength(dict)
{
    var count = 0;
    for (_ in dict)
    {
        count++;
    }
    return count;
}
/**
 * @param {string} name - The name displayed within the menu.
 * @param {string[]} values - The options that will be shown in the dropdown.
 * @param {boolean} multi - Allows you to have multiple selected options.
 * @return {void}
 **/
function createDropdown(name, values, multi)
{
    UI[multi ? "AddMultiDropdown" : "AddDropdown"](name, values);
    binlib[name] = {
        "multi": multi,
        "values":
        {}
    };
    multi && values.reverse();
    var i = 0;
    for (value in values)
    {
        var index = multi ? (1 << (values.length - (i + 1))) : i;
        binlib[name].values[index] = values[value];
        i++;
    }
}
/**
 * @param {(string|undefined)} name - Fetches the selected option(s) of a specified dropdown, if undefined it will return all saved dropdowns' selected item(s).
 * @return {(Array|Dictionary[])} - If name is undefined the format is {Dropdown1: ["Slecected1", "Selected2"], Dropdown2: ["Slecected1", "Selected2"]}, else it will return a single array of selected items.
 **/
function fetchDropdown(name)
{
    var selection = (name ? [] :
    {})
    var bin = UI.GetValue("Misc", name);
    !name && function()
    {
        for (dropdown in binlib) selection[dropdown] = fetchDropdown(dropdown)
    }();
    if (name)
    {
        !binlib[name].multi && bin == 0 && selection.push(binlib[name].values[0]) && function()
        {
            return selection;
        }();
        for (var i = dictLength(binlib[name].values) - 1; i >= 0; i--)
        {
            if (!binlib[name].multi && i == 0) continue;
            var index = binlib[name].multi ? (1 << i) : i;
            if (bin - index >= 0)
            {
                bin -= (index);
                selection.push(binlib[name].values[index]);
            }
        }
    }
    return selection;
}
Cheat.RegisterCallback("FrameStageNotify", "aim");
Cheat.RegisterCallback("FrameStageNotify", "calcEnemy");
Cheat.RegisterCallback("Draw", "drawFOV");
Cheat.RegisterCallback("Draw", "updateMenu");
