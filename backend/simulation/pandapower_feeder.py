import pandapower as pp
import pandapower.networks as nw

class PandapowerFeeder:
    """
    A sub-grid sandbox for physics validation.
    Models a simple distribution feeder with a step-down transformer (11kV to 0.4kV),
    a few residential loads, and a rooftop solar connection.
    """
    def __init__(self):
        self.net = pp.create_empty_network()
        
        # Create buses
        # Bus 0: 11kV Medium Voltage (Grid connection point)
        self.b0 = pp.create_bus(self.net, vn_kv=11.0, name="Grid Connection (11kV)")
        
        # Bus 1: 0.4kV Low Voltage (Secondary side of Transformer)
        self.b1 = pp.create_bus(self.net, vn_kv=0.4, name="LV Feeder Root (0.4kV)")
        
        # Bus 2: House 1 (Consumer)
        self.b2 = pp.create_bus(self.net, vn_kv=0.4, name="House 1 Bus")
        
        # Bus 3: House 2 (Consumer + Rooftop Solar)
        self.b3 = pp.create_bus(self.net, vn_kv=0.4, name="House 2 (Prosumer) Bus")
        
        # External Grid (Slack Bus)
        pp.create_ext_grid(self.net, bus=self.b0, vm_pu=1.0, name="External Grid")
        
        # Transformer: 11kV to 0.4kV (400V / 230V phase-to-neutral)
        pp.create_transformer_from_parameters(self.net, hv_bus=self.b0, lv_bus=self.b1, 
                                              sn_mva=0.4, vn_hv_kv=11.0, vn_lv_kv=0.4, 
                                              vkr_percent=1.0, vk_percent=4.0, pfe_kw=1.0, i0_percent=0.2,
                                              name="Distribution Transformer")
                                              
        # Lines (Standard Low Voltage cables)
        # We use standard parameters for LV cables, e.g. NA2XS2Y
        line_params = {"c_nf_per_km": 210, "r_ohm_per_km": 0.641, "x_ohm_per_km": 0.1, "max_i_ka": 0.142}
        pp.create_line_from_parameters(self.net, from_bus=self.b1, to_bus=self.b2, length_km=0.1, name="Line to House 1", **line_params)
        pp.create_line_from_parameters(self.net, from_bus=self.b1, to_bus=self.b3, length_km=0.15, name="Line to House 2", **line_params)
        
        # Loads and Generation placeholders
        # p_mw = Real Power, q_mvar = Reactive Power
        self.load1 = pp.create_load(self.net, bus=self.b2, p_mw=0.002, q_mvar=0.0005, name="House 1 Load")
        self.load2 = pp.create_load(self.net, bus=self.b3, p_mw=0.002, q_mvar=0.0005, name="House 2 Load")
        
        # Sgen (Static Generator) for Rooftop Solar at House 2
        self.solar = pp.create_sgen(self.net, bus=self.b3, p_mw=0.0, q_mvar=0.0, name="Rooftop Solar")
        
    def step(self, house1_kw: float, house2_kw: float, solar_gen_kw: float):
        """Update the load flow sandbox with current generation and consumption in kW"""
        # Pandapower uses MW, so we divide kW by 1000
        self.net.load.loc[self.load1, "p_mw"] = house1_kw / 1000.0
        self.net.load.loc[self.load2, "p_mw"] = house2_kw / 1000.0
        
        self.net.sgen.loc[self.solar, "p_mw"] = solar_gen_kw / 1000.0
        
        try:
            pp.runpp(self.net)
        except pp.LoadflowNotConverged:
            print("PANDAPOWER: Loadflow did not converge!")
            return None
            
        # Extract interesting physics metrics
        # Voltage magnitude in per unit (p.u.). 1.0 is nominal.
        # Below 0.95 is sag, above 1.05 is overvoltage.
        house1_v_pu = self.net.res_bus.vm_pu.at[self.b2]
        house2_v_pu = self.net.res_bus.vm_pu.at[self.b3]
        
        # Transformer loading percent
        trafo_loading = self.net.res_trafo.loading_percent.at[0]
        
        return {
            "house1_v_pu": house1_v_pu,
            "house2_v_pu": house2_v_pu,
            "trafo_loading_percent": trafo_loading
        }
