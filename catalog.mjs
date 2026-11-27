export {items} from './items.mjs';
export const outfits = ['AirCrew','AmbulanceDriver','ArmyCamoDesert','ArmyCamoGreen','ArmyServiceUniform','Bandit','BaseballPlayer_KY','BaseballPlayer_Rangers','BaseballPlayer_Z','Bathrobe','Bedroom','Biker','Camper','Classy','Cook_Generic','ConstructionWorker','Cyclist','Doctor','DressLong','DressNormal','DressShort','Farmer','Fireman','FiremanFullSuit','Foreman','Fisherman','FitnessInstructor','Fossoil','Gas2Go','Golfer','HazardSuit','HospitalPatient','Hunter','Inmate','InmateKhaki','McCoys','Mechanic','MetalWorker','Nurse','OfficeWorker','Party','PokerDealer','Priest','Police','Punk','Raider','Ranger','Redneck','Rocker','Santa','SantaGreen','SportsFan','Student','Survivalist','Survivalist02','Survivalist03','Teacher','Thug','ThunderGas','Varsity','Waiter_Classy','Waiter_Diner','Waiter_Restaurant','Police_SWAT','PoliceRiot','PoliceState','Security','MallSecurity','PrisonGuard','Chef'];
export const makeRule = (item='Base.Axe', chance='5', outfit='') => ({item,outfit,chance:String(chance),more:'0',moreChance:'50'});
export const presets = {
  survival: [['Base.BeefJerky',5],['Base.WaterBottle',3],['Base.Bandage',5],['Base.HuntingKnife',0.5]],
  fire: [['Base.Axe',5,'Fireman'],['Base.Extinguisher',10,'Fireman'],['Base.FirstAidKit',3,'Fireman']],
  medical: [['Base.FirstAidKit',5,'Doctor'],['Base.Bandage',20,'Doctor'],['Base.Pills',10,'Nurse'],['Base.Gloves_Surgical',15,'Nurse']],
  workshop: [['Base.Hammer',5,'ConstructionWorker'],['Base.NailsBox',10,'ConstructionWorker'],['Base.DuctTape',8,'Mechanic'],['Base.Screwdriver',10,'Mechanic']]
};
