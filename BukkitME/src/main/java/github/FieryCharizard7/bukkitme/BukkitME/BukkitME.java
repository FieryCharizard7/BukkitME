package github.FieryCharizard7.bukkitme.BukkitME;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public class BukkitME extends JavaPlugin {

	private Object playerList;
	private Object playerData(Player player) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void onEnable() {
		getLogger().info("onEnable has been invoked!");
		
		// get info on all players
		/* for (Player player : Bukkit.getServer().getOnlinePlayers()) {
		    playerList.put(player.getName(), playerData(player));
		} */
	}

	@Override
	public void onDisable() {
		getLogger().info("onDisable has been invoked!");
	}
	
	@Override
	public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
		if (cmd.getName().equalsIgnoreCase("basic")) { // If the player typed /basic then do the following, note: If you only registered this executor for one command, you don't need this
			// doSomething
			return true;
		} //If this has happened the function will return true. 
	        // If this hasn't happened the value of false will be returned.
		return false; 
	}
}

